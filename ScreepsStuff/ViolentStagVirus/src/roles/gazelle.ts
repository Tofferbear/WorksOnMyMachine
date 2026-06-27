// src/roles/gazelle.ts

import { IRole } from "./Role";

export class GazelleRole implements IRole {
  public roleName = "gazelle";

  public getPriority(room: Room, counts: any): number {
    return 75;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    if (!room.memory.remoteRooms || room.memory.remoteRooms.length === 0) {
      return (counts.gazelle || 0) < 1;
    }
    return false;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    return [MOVE];
  }

  public getNewName(): string {
     const names = ["Wind_Runner", "Far_Sight", "Plains_Drifter", "Swift_Step", "Trail_Blazer"];
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
    if (!creep.memory.targetRoom) {
        const exits = Game.map.describeExits(creep.room.name);
        const adjacentRooms = Object.values(exits) as string[];
        const unscouted = adjacentRooms.filter(r => !Memory.rooms || !Memory.rooms[r] || !Memory.rooms[r].sources);
        
        if (unscouted.length > 0) {
            creep.memory.targetRoom = unscouted[Math.floor(Math.random() * unscouted.length)];
        } else {
            creep.memory.targetRoom = adjacentRooms[Math.floor(Math.random() * adjacentRooms.length)];
        }
    }

    if (creep.room.name !== creep.memory.targetRoom) {
        const route = Game.map.findRoute(creep.room.name, creep.memory.targetRoom);
        if (route !== ERR_NO_PATH && route.length > 0) {
            const exit = creep.pos.findClosestByPath(route[0].exit);
            if (exit) {
                creep.moveTo(exit, { visualizePathStyle: { stroke: '#00ffff' } });
            }
        }
    } else {
        creep.say("🔭 scout");
        if (!Memory.rooms) Memory.rooms = {};
        if (!Memory.rooms[creep.room.name]) Memory.rooms[creep.room.name] = {};
        
        const sources = creep.room.find(FIND_SOURCES);
        Memory.rooms[creep.room.name].sources = sources.map(s => s.id);
        
        const mineral = creep.room.find(FIND_MINERALS)[0];
        if (mineral) Memory.rooms[creep.room.name].mineral = mineral.id;

        if (creep.room.controller) {
            Memory.rooms[creep.room.name].controllerId = creep.room.controller.id;
        }

        if (Game.time % 10 === 0) {
           delete creep.memory.targetRoom;
        } else {
            creep.moveTo(new RoomPosition(25, 25, creep.room.name), { range: 5 });
        }
    }
  }
}
