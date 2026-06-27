// src/roles/schomburgk.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";

export class SchomburgkRole implements IRole {
  public roleName = "schomburgk";

  private _pendingTargetRoom: string | null = null;

  public getPriority(room: Room, counts: any): number {
    return 125;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    if (!room.memory.remoteRooms || room.memory.remoteRooms.length === 0) return false;

    for (const remoteRoomName of room.memory.remoteRooms) {
      const remoteRoomObj = Game.rooms[remoteRoomName];
      if (!remoteRoomObj) continue; // Requires vision to detect sites/damage

      // Skip rooms that have graduated to sovereign bases
      if (remoteRoomObj.find(FIND_MY_SPAWNS).length > 0) continue;

      const schomburgksTargeting = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === remoteRoomName);
      if (schomburgksTargeting.length > 0) continue;

      const sites = remoteRoomObj.find(FIND_CONSTRUCTION_SITES);
      let needsRepair = false;
      if (sites.length === 0) {
        const damagedStr = remoteRoomObj.find(FIND_STRUCTURES, {
          filter: s => (s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER) && 
                       s.hits < s.hitsMax * 0.60
        });
        needsRepair = damagedStr.length > 0;
      }

      if (sites.length > 0 || needsRepair) {
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
    // Schomburgk is a remote builder. WORK/CARRY/MOVE balanced.
    const segment = [WORK, CARRY, MOVE];
    const cost = 200;
    const count = Math.min(Math.floor(energy / cost), 10);
    let body: BodyPartConstant[] = [];
    for(let i=0; i<Math.max(1, count); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Br1ck_Buck", "Th0rn_Waver", "Pavement_Pala", "Out_Found_K2", "Gully_Gazer", "Road_Reap"];
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

    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
        creep.memory.working = false;
        creep.say("📡 pull");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say("🔨 build");
    }

    if (creep.room.name !== targetRoom && !creep.memory.working) {
        const route = Game.map.findRoute(creep.room.name, targetRoom);
        if (route !== ERR_NO_PATH && route.length > 0) {
            const exit = creep.pos.findClosestByPath(route[0].exit);
            if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
        }
        return;
    }

    if (creep.memory.working) {
        const site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
        if (site) {
            if (creep.build(site) === ERR_NOT_IN_RANGE) {
                creep.moveTo(site, { visualizePathStyle: { stroke: "#ffffff" } });
            } else {
                MetricsUtils.recordStat(creep.name, "energyBuilt", creep.getActiveBodyparts(WORK) * BUILD_POWER);
            }
        } else {
            const damagedStruct = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER) && s.hits < s.hitsMax * 0.8
            });
            if (damagedStruct) {
               if (creep.repair(damagedStruct) === ERR_NOT_IN_RANGE) creep.moveTo(damagedStruct);
            } else {
               creep.say("💤 idle");
               const flag = creep.room.find(FIND_FLAGS)[0];
               if (flag) creep.moveTo(flag);
            }
        }
    } else {
        if (creep.room.name !== targetRoom) {
            const route = Game.map.findRoute(creep.room.name, targetRoom);
            if (route !== ERR_NO_PATH && route.length > 0) {
                const exit = creep.pos.findClosestByPath(route[0].exit);
                if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            return;
        }
        
        const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
        });

        if (dropped) {
            if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
                creep.moveTo(dropped, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            return;
        }

        const containers = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        }) as StructureContainer[];
        
        const targetContainer = creep.pos.findClosestByPath(containers);
        if (targetContainer) {
            if (creep.withdraw(targetContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targetContainer, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
               if (creep.harvest(source) === ERR_NOT_IN_RANGE) creep.moveTo(source);
            }
        }
    }
  }
}
