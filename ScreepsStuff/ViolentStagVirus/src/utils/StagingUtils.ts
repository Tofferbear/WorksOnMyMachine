// src/utils/StagingUtils.ts

export class StagingUtils {
    /**
     * Move a creep away from any nearby spawners and toward a proactive staging area.
     */
    public static parkCreep(creep: Creep, targetPos?: RoomPosition): void {
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return;

        const nearestSpawn = creep.pos.findClosestByRange(spawns);
        if (!nearestSpawn) return;

        // Calculate Midway Goal (Midpoint between Spawn and Controller)
        const controller = creep.room.controller;
        let midwayGoal: RoomPosition | undefined;
        if (controller) {
            const midX = Math.floor((nearestSpawn.pos.x + controller.pos.x) / 2);
            const midY = Math.floor((nearestSpawn.pos.y + controller.pos.y) / 2);
            midwayGoal = new RoomPosition(midX, midY, creep.room.name);
        }

        const effectiveGoal = targetPos || (creep.room.storage ? creep.room.storage.pos : (midwayGoal || new RoomPosition(25, 25, creep.room.name)));
        const currentDist = creep.pos.getRangeTo(nearestSpawn);

        // PHASE 1: Emergency Clear (If too close to spawn exit)
        if (currentDist <= 2) {
            let validSpots: RoomPosition[] = [];
            for (let r = 3; r <= 6; r++) {
                if (validSpots.length > 0) break;
                for (let dx = -r; dx <= r; dx++) {
                    for (let dy = -r; dy <= r; dy++) {
                        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                        const x = nearestSpawn.pos.x + dx;
                        const y = nearestSpawn.pos.y + dy;
                        if (x < 1 || x > 48 || y < 1 || y > 48) continue;
                        const terrain = Game.map.getRoomTerrain(creep.room.name);
                        if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
                        const pos = new RoomPosition(x, y, creep.room.name);
                        const isBlocked = pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_CONTAINER);
                        if (isBlocked || pos.lookFor(LOOK_CREEPS).filter(c => c.id !== creep.id).length > 0) continue;
                        validSpots.push(pos);
                    }
                }
            }

            if (validSpots.length > 0) {
                const offset = creep.name.length % validSpots.length;
                validSpots.sort((a, b) => a.getRangeTo(effectiveGoal) - b.getRangeTo(effectiveGoal));
                const bestParkPos = validSpots[offset] || validSpots[0];
                creep.moveTo(bestParkPos, { visualizePathStyle: { stroke: '#ff0000', lineStyle: 'dashed' }, range: 0 });
                creep.say("🚚 clearing");
                return; // Early return: clearing the spawn is the highest priority
            }
        }

        // PHASE 2: Proactive Staging (Move toward the Midway Lodge)
        // If we are already clear of the spawn, move to the Midway zone (staying in a loose cluster)
        if (creep.pos.getRangeTo(effectiveGoal) > 4) {
            creep.moveTo(effectiveGoal, { 
                range: 4, 
                visualizePathStyle: { stroke: '#555555', lineStyle: 'dotted' } 
            });
            creep.say("🏕️ staging");
        }
    }
}
