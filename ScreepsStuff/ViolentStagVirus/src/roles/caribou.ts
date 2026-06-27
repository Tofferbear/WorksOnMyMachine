// src/roles/caribou.ts

import { IRole } from "./Role";

export class CaribouRole implements IRole {
  public roleName = "caribou";

  private _pendingTargetRoom: string | null = null;

  public getPriority(room: Room, counts: any): number {
    return 112;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    if (Memory.empire?.skills?.global?.remoteMiningEnabled === false) return false;
    // 1. Check for expansion target
    if (Memory.empire?.targetExpansionRoom && !Memory.empire?.expansionRoomClaimed) {
      const expansionTarget = Memory.empire.targetExpansionRoom;
      const reserversTargeting = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === expansionTarget);
      if (reserversTargeting.length < 1) {
        this._pendingTargetRoom = expansionTarget;
        return true;
      }
    }

    // 2. Check for remote outpost reservation
    if (!room.memory.remoteRooms || room.memory.remoteRooms.length === 0) return false;

    for (const remoteRoomName of room.memory.remoteRooms) {
      // Skip rooms that have graduated to sovereign bases
      const remoteRoomObj = Game.rooms[remoteRoomName];
      if (remoteRoomObj && remoteRoomObj.find(FIND_MY_SPAWNS).length > 0) continue;

      const reserversTargeting = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === remoteRoomName);
      if (reserversTargeting.length < 1) {
        this._pendingTargetRoom = remoteRoomName;
        return true;
      }
    }
    return false;
  }

  public getInitialMemory(room: Room, counts: any): Partial<CreepMemory> {
    const mem: Partial<CreepMemory> = {
      targetRoom: this._pendingTargetRoom || undefined,
    };
    this._pendingTargetRoom = null;
    return mem;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // Caribou is a reserver. CLAIM/MOVE.
    // Each CLAIM part cost 600.
    if (energy >= 1300) return [CLAIM, CLAIM, MOVE, MOVE];
    return [CLAIM, MOVE];
  }

  public getNewName(): string {
     const names = ["Frost_Hoof", "Boreal_Bard", "Tundra_Trot", "Arctic_Aim", "Snow_Staker", "Icy_Icon"];
     return this.generateName(names);
  }

  private generateName(nameList: string[]): string {
    if (!Memory.nameCounters) Memory.nameCounters = {};
    const livingBaseNames = _.filter(Game.creeps, c => c.memory.role === this.roleName)
                             .map(c => c.name.split('_')[0]);
    const availableNames = nameList.filter(name => !livingBaseNames.includes(name));
    const baseName = availableNames.length > 0 
        ? availableNames[Math.floor(Math.random() * availableNames.length)]
        : nameList[Math.floor(Math.random() * nameList.length)];

    Memory.nameCounters[baseName] = (Memory.nameCounters[baseName] || 0) + 1;
    return `${baseName}_${Memory.nameCounters[baseName]} (${this.roleName.charAt(0).toUpperCase() + this.roleName.slice(1)})`;
  }

  public run(creep: Creep): void {
    const targetRoom = creep.memory.targetRoom;
    if (!targetRoom) return;

    if (creep.room.name !== targetRoom) {
        const route = Game.map.findRoute(creep.room.name, targetRoom);
        if (route !== ERR_NO_PATH && route.length > 0) {
            const exit = creep.pos.findClosestByPath(route[0].exit);
            if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff00ff' } });
        }
        return;
    }

    if (creep.room.controller) {
        const isExpansion = Memory.empire && Memory.empire.targetExpansionRoom === targetRoom;

        if (isExpansion && creep.room.controller.my) {
            creep.say("🏠 home");
            if (Memory.empire) Memory.empire.expansionRoomClaimed = true;
            const homeSpawn = Object.values(Game.spawns).find(s => s.room.name !== targetRoom);
            if (homeSpawn) {
                if (creep.pos.getRangeTo(homeSpawn) > 1) creep.moveTo(homeSpawn, { reusePath: 20 });
            }
            return;
        }

        let result: ScreepsReturnCode;
        const reservation = creep.room.controller.reservation;
        if (reservation && reservation.username !== creep.owner.username) {
            result = creep.attackController(creep.room.controller);
            creep.say("⚔️ purge");
        } else if (isExpansion) {
            result = creep.claimController(creep.room.controller);
            creep.say("🏁 claim");
        } else {
            result = creep.reserveController(creep.room.controller);
            creep.say("🛡️ reserve");
        }

        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ff00ff' } });
        } else if (result === OK) {
            if (!creep.room.controller.sign || creep.room.controller.sign.username !== "Tofferbear") {
                creep.signController(creep.room.controller, "The Violent Stag Virus claims this territory. 🦌");
            }
        }
    }
  }
}
