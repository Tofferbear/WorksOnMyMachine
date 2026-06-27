// src/managers/HerdExpansionManager.ts

 

export class HerdExpansionManager {

    public run(): void {
        // Run fast when actively expanding, slow otherwise
        const hasActiveExpansion = Memory.empire?.targetExpansionRoom != null;
        if (hasActiveExpansion ? Game.time % 10 !== 0 : Game.time % 100 !== 0) return;

        // graduation cleanup
        if (Memory.empire?.targetExpansionRoom) {
            this.checkInitialGraduation(Memory.empire.targetExpansionRoom);
        }

        // Check for "Mature" graduation (Becoming a full Home Base)
        if (Memory.empire?.remoteBases) {
            for (const roomName of [...Memory.empire.remoteBases]) {
                this.checkMatureGraduation(roomName);
            }
        }

        // 1. Determine if we should expand
        const myRooms = _.filter(Game.rooms, r => r.controller && r.controller.my);
        const maxRooms = Game.gcl.level;

        if (myRooms.length >= maxRooms) return; // Cannot expand

        // Ensure we have a stable base (RCL 4+) before trying to expand
        const stableBases = myRooms.filter(r => r.controller!.level >= 4);
        if (stableBases.length === 0) return;

        // 2. Select target room (closest room with highest sources)
        if (!Memory.empire) Memory.empire = {};
        if (!Memory.empire.targetExpansionRoom) {
            this.selectExpansionTarget(stableBases[0]);
        } else {
            // Persistent Support check: Ensure active expansion target is adopted by stable base
            const targetRoom = Memory.empire.targetExpansionRoom;
            const baseRoom = stableBases[0];
            if (baseRoom && (!baseRoom.memory.remoteRooms || !baseRoom.memory.remoteRooms.includes(targetRoom))) {
                if (!baseRoom.memory.remoteRooms) baseRoom.memory.remoteRooms = [];
                baseRoom.memory.remoteRooms.push(targetRoom);
                console.log(`[Expansion] Re-established economic support for ${targetRoom} from ${baseRoom.name}`);
            }
        }

        // 3. Dispatch Caribou and Reindeer logic is now handled autonomously
        // by CaribouRole and ReindeerRole during the SpawnManager cycle.
    }

    private checkInitialGraduation(targetRoom: string): void {
        const newRoomObj = Game.rooms[targetRoom];
        if (!newRoomObj || newRoomObj.find(FIND_MY_SPAWNS).length === 0) return;

        console.log(`[Expansion] 🎉 ${targetRoom} has a Spawn — graduating to remote base!`);

        // Tag as remote base for correct client visuals and support
        if (!Memory.empire) Memory.empire = {};
        if (!Memory.empire.remoteBases) Memory.empire.remoteBases = [];
        if (!Memory.empire.remoteBases.includes(targetRoom)) {
            Memory.empire.remoteBases.push(targetRoom);
        }

        delete Memory.empire.targetExpansionRoom;
        delete Memory.empire.expansionRoomClaimed;
    }

    private checkMatureGraduation(roomName: string): void {
        const room = Game.rooms[roomName];
        if (!room) return;

        // Mature milestone: RCL 4 AND has a local energy producer
        const hasProducer = _.some(Game.creeps, c => 
            (c.memory.role === 'buck' || c.memory.role === 'javan') && 
            (c.room.name === roomName || c.memory.targetRoom === roomName)
        );

        if (room.controller && room.controller.level >= 4 && hasProducer) {
            console.log(`[Expansion] 🏰 ${roomName} is self-sufficient — graduating to full HOME BASE!`);
            
            // Remove from remoteBases list
            if (Memory.empire && Memory.empire.remoteBases) {
                Memory.empire.remoteBases = Memory.empire.remoteBases.filter(r => r !== roomName);
            }

            // Remove from every parent room's remoteRooms list (Recalling Reindeers etc)
            for (const otherRoomName in Game.rooms) {
                const otherRoom = Game.rooms[otherRoomName];
                if (otherRoom.memory?.remoteRooms?.includes(roomName)) {
                    otherRoom.memory.remoteRooms = otherRoom.memory.remoteRooms.filter(r => r !== roomName);
                    console.log(`[Expansion] Removed ${roomName} from ${otherRoomName}'s outpost list.`);
                }
            }

            // Recall outpost creeps assigned to the graduated room
            const outpostRoles = ["javan", "sambar", "schomburgk", "reindeer"];
            for (const name in Game.creeps) {
                const creep = Game.creeps[name];
                if (creep.memory.targetRoom === roomName && outpostRoles.includes(creep.memory.role)) {
                    delete creep.memory.targetRoom;
                    delete creep.memory.targetSource;
                    console.log(`[Expansion] Recalling ${creep.name} (${creep.memory.role}) — ${roomName} is now independent.`);
                }
            }
        }
    }

    private selectExpansionTarget(baseRoom: Room): void {
        if (!Memory.rooms) return;

        let bestRoom: string | null = null;
        let maxSources = 0;
        let minDistance = Infinity;

        for (const roomName in Memory.rooms) {
            const roomData = Memory.rooms[roomName];
            if (!roomData.sources || roomData.sources.length === 0) continue;
            if (!roomData.controllerId) continue; // Needs a controller to expand to

            // Ensure it's not already ours or someone else's
            if (Game.rooms[roomName] && Game.rooms[roomName].controller!.my) continue;

            // Simple Manhattan distance / room distance
            const route = Game.map.findRoute(baseRoom.name, roomName);
            if (route === ERR_NO_PATH) continue;

            const distance = route.length;
            const numSources = roomData.sources.length;

            if (numSources > maxSources || (numSources === maxSources && distance < minDistance)) {
                maxSources = numSources;
                minDistance = distance;
                bestRoom = roomName;
            }
        }

        if (bestRoom) {
            if (!Memory.empire) Memory.empire = {};
            Memory.empire.targetExpansionRoom = bestRoom;
            console.log(`[Expansion] Selected new target: ${bestRoom} (Sources: ${maxSources}, Dist: ${minDistance})`);

            // Immediately add it to the base room's remoteRooms list so we 
            // can provide economic support (Javans, Sambars, Schomburgks)
            if (!baseRoom.memory.remoteRooms) baseRoom.memory.remoteRooms = [];
            if (!baseRoom.memory.remoteRooms.includes(bestRoom)) {
                baseRoom.memory.remoteRooms.push(bestRoom);
                console.log(`[Expansion] Adopted ${bestRoom} as a temporary support outpost for ${baseRoom.name}.`);
            }
        }
    }
}
