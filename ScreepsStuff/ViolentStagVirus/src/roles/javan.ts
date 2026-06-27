// src/roles/javan.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";

export class JavanRole implements IRole {
  public roleName = "javan";

  private _pendingTargetRoom: string | null = null;
  private _pendingTargetSource: string | null = null;

  public getPriority(room: Room, counts: any): number {
    return 115;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    if (Memory.empire?.skills?.global?.remoteMiningEnabled === false) return false;
    if (!room.memory.remoteMiningActive) return false;
    if (!room.memory.remoteRooms || room.memory.remoteRooms.length === 0) return false;

    for (const remoteRoomName of room.memory.remoteRooms) {
      const remoteRoomData = Memory.rooms?.[remoteRoomName];
      if (!remoteRoomData || !remoteRoomData.sources) continue;

      // Skip rooms that have graduated to sovereign bases
      const remoteRoomObj = Game.rooms[remoteRoomName];
      if (remoteRoomObj && remoteRoomObj.find(FIND_MY_SPAWNS).length > 0) continue;

      const javansTargeting = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === remoteRoomName);
      
      for (const sId of remoteRoomData.sources) {
        if (!javansTargeting.find(j => j.memory.targetSource === sId)) {
          this._pendingTargetRoom = remoteRoomName;
          this._pendingTargetSource = sId;
          return true;
        }
      }
    }
    return false;
  }

  public getInitialMemory(room: Room, counts: any): Partial<CreepMemory> {
    const mem: Partial<CreepMemory> = {
      targetRoom: this._pendingTargetRoom || undefined,
      targetSource: (this._pendingTargetSource as Id<Source>) || undefined
    };
    this._pendingTargetRoom = null;
    this._pendingTargetSource = null;
    return mem;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // Javan is a remote miner. 5 WORK is max efficient for 3000 source.
    // Plus CARRY for building containers and MOVE to get there.
    if (energy >= 650) {
      return [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE];
    }
    const segment = [WORK, CARRY, MOVE];
    const cost = 200;
    const count = Math.min(Math.floor(energy / cost), 5);
    let body: BodyPartConstant[] = [];
    for(let i=0; i<Math.max(1, count); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Java_Hulk", "Roast_Bean", "Deep_Dig", "Out_Post_12", "Solo_Tine", "Crag_Hoof"];
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
    if (!creep.memory.targetRoom || !creep.memory.targetSource) return;

    if (creep.room.name !== creep.memory.targetRoom) {
        const route = Game.map.findRoute(creep.room.name, creep.memory.targetRoom);
        if (route !== ERR_NO_PATH && route.length > 0) {
            const exit = creep.pos.findClosestByPath(route[0].exit);
            if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
    }

    // Anti-Bounce: Step off the exit tile immediately upon entering the destination room!
    if (creep.pos.x === 0 || creep.pos.x === 49 || creep.pos.y === 0 || creep.pos.y === 49) {
        creep.moveTo(new RoomPosition(25, 25, creep.room.name), { maxRooms: 1, range: 20 });
        return;
    }

    let source = Game.getObjectById(creep.memory.targetSource as Id<Source>);
    if (!source) {
        const s = creep.pos.findClosestByPath(FIND_SOURCES);
        if (s) {
            creep.memory.targetSource = s.id;
            source = s;
        } else {
            return;
        }
    }

    const container = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } })[0] as StructureContainer;
    const site = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, { filter: { structureType: STRUCTURE_CONTAINER } })[0];

    let targetPos = source.pos;
    if (container) targetPos = container.pos;
    else if (site) targetPos = site.pos;

    if (creep.pos.getRangeTo(targetPos) > 0) { 
       if (container || site) {
           creep.moveTo(targetPos, { visualizePathStyle: { stroke: '#ffaa00' }, maxRooms: 1, ignoreCreeps: false });
           return;
       }
    }

    if (site && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.build(site) === OK) {
            creep.say("🔨 build");
            MetricsUtils.recordStat(creep.name, "energyBuilt", creep.getActiveBodyparts(WORK) * BUILD_POWER);
        }
        return;
    }

    const result = creep.harvest(source);
    if (result === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' }, maxRooms: 1, ignoreCreeps: false });
    } else if (result === OK) {
      creep.say("⛏️ dig");
      MetricsUtils.recordStat(creep.name, "energyHarvested", creep.getActiveBodyparts(WORK) * HARVEST_POWER);
    } else if (result === ERR_NOT_ENOUGH_RESOURCES) {
      creep.say("⏳ wait");
    }
  }
}
