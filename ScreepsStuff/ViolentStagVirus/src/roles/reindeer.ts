// src/roles/reindeer.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";
import { StagingUtils } from "../utils/StagingUtils";
import { ConstructUtils } from "../utils/ConstructUtils";

export class ReindeerRole implements IRole {
  public roleName = "reindeer";
  private _pendingTargetRoom?: string;

  public getPriority(room: Room, counts: any): number {
    return 20;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    // 1. Check for emergency support targets (Empire Rescue)
    if (Memory.empire && Memory.empire.supportTargets && Memory.empire.supportTargets.length > 0) {
      for (const target of Memory.empire.supportTargets) {
        if (target === room.name) continue;
        
        const reindeers = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === target);
        if (reindeers.length < 2) {
          this._pendingTargetRoom = target;
          return true;
        }
      }
    }

    // 2. Check for expansion target
    if (Memory.empire?.targetExpansionRoom && Memory.empire?.expansionRoomClaimed) {
      const expansionTarget = Memory.empire.targetExpansionRoom;
      const reindeers = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === expansionTarget);
      if (reindeers.length < 4) {
        this._pendingTargetRoom = expansionTarget;
        return true;
      }
    }
    return false;
  }

  public getInitialMemory(room: Room, counts: any): any {
    const mem: any = { targetRoom: this._pendingTargetRoom };
    this._pendingTargetRoom = undefined; // Clear it for next check
    return mem;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // Reindeer are remote generalists. Balanced WORK/CARRY/MOVE.
    const segment = [WORK, CARRY, MOVE];
    const cost = 200;
    const count = Math.min(Math.floor(energy / cost), 10);
    let body: BodyPartConstant[] = [];
    for(let i=0; i<Math.max(1, count); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Blitzen_K4", "Rudolph_X", "Vixen_B1", "Comet_T9", "Cupid_Prime", "Donner_H6", "Prancer_G2", "Dasher_W3"];
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
    let targetRoom = creep.memory.targetRoom;
    if (!targetRoom) {
        // Fallback: if no targetRoom, try to find one in empire memory
        if (Memory.empire?.targetExpansionRoom) {
            targetRoom = Memory.empire.targetExpansionRoom;
            creep.memory.targetRoom = targetRoom;
        } else {
            return;
        }
    }

    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
        creep.memory.working = false;
        creep.say("⛏️ dig");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say("🔨 pioneer");
    }

    if (creep.room.name !== targetRoom && !creep.memory.working) {
        const route = Game.map.findRoute(creep.room.name, targetRoom);
        if (route !== ERR_NO_PATH && route.length > 0) {
            const exit = creep.pos.findClosestByPath(route[0].exit);
            if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff00ff' } });
        }
        return;
    }

    if (creep.memory.working) {
        let site = ConstructUtils.getPrioritySite(creep);
        if (site) {
            if (creep.build(site) === ERR_NOT_IN_RANGE) {
                creep.moveTo(site, { visualizePathStyle: { stroke: "#ffffff" } });
            } else {
                MetricsUtils.recordStat(creep.name, "energyBuilt", creep.getActiveBodyparts(WORK) * BUILD_POWER);
            }
            return;
        }

        const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        if (spawn && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
            return;
        }

        if (creep.room.controller && creep.room.controller.my) {
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            } else {
                MetricsUtils.recordStat(creep.name, "energyUpgraded", creep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER);
            }
        } else {
            // No work found — retreat to a parking spot at least 3 blocks away
            const parkingPos = creep.room.storage ? creep.room.storage.pos : undefined;
            StagingUtils.parkCreep(creep, parkingPos);
        }
    } else {
        if (creep.room.name !== creep.memory.targetRoom) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom!));
            return;
        }

        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (source) {
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            } else {
                MetricsUtils.recordStat(creep.name, "energyHarvested", creep.getActiveBodyparts(WORK) * HARVEST_POWER);
            }
        } else {
            // No active source found — retreat to a parking spot
            const parkingPos = creep.room.storage ? creep.room.storage.pos : undefined;
            StagingUtils.parkCreep(creep, parkingPos);
        }
    }
  }
}
