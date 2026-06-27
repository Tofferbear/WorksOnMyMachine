// src/roles/elk.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";
import { ScavengeUtils } from "../utils/ScavengeUtils";
import { StagingUtils } from "../utils/StagingUtils";

export class ElkRole implements IRole {
  public roleName = "elk";

  public getPriority(room: Room, counts: any): number {
    return 110;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    if (!room.controller) return false;
    
    let desiredElks = 0;
    if (room.controller.level === 8) {
      desiredElks = 1; // RCL 8 cap
    } else if (room.storage) {
      const stored = room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
      if (stored > 750000) desiredElks = 5;
      else if (stored > 500000) desiredElks = 4;
      else if (stored > 250000) desiredElks = 3;
      else if (stored > 100000) desiredElks = 2;
      else if (stored > 50000) desiredElks = 1;
      else desiredElks = 0;
    } else {
      desiredElks = 2; // Early game bootstrap
    }

    let limit = Memory.empire?.skills?.[room.name]?.elkLimit ?? desiredElks;
    
    // SAFETY OVERRIDE: Prevent controller downgrades!
    if (room.controller.ticksToDowngrade < 5000) {
        limit = Math.max(limit, 1);
    }

    // SAFETY OVERRIDE: If we are a young base without Storage, we MUST climb to RCL 4!
    if (!room.storage && room.controller.level < 4) {
        limit = Math.max(limit, 1); // Guarantee at least 1 upgrader to push RCL
    }

    return counts.elk < limit;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // Elk is a base upgrader. Mostly WORK parts, minimal MOVE/CARRY.
    const segment = [WORK, WORK, CARRY, MOVE];
    const cost = 300;
    const count = Math.min(Math.floor(energy / cost), 5); // Up to 10 WORK parts
    let body: BodyPartConstant[] = [];
    for(let i=0; i<Math.max(1, count); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Elk_R1dge", "H4rt_V3nado", "Kudu_Vane", "Nyala_Thorn", "Muzz_Kerr", "StagFrame_Ω", "Thorn_Crown", "Moss_Haunch"];
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
    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
        creep.memory.working = false;
        creep.say("📡 pull");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say("✨ upgrade");
    }

    ScavengeUtils.tryScavengeEnergy(creep, 1);

    if (creep.memory.working) {
        if (creep.room.controller) {
            const result = creep.upgradeController(creep.room.controller);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#48ff00" } });
            } else if (result === OK) {
                MetricsUtils.recordStat(creep.name, "energyUpgraded", creep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER);
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= creep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER) {
                    const adjacentContainer = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_LINK) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                    })[0];
                    if (adjacentContainer) creep.withdraw(adjacentContainer, RESOURCE_ENERGY);
                }
            }
        }
    } else {
        let target: AnyStructure | Resource | null = null;
        if (creep.room.controller) {
            const controllerLink = creep.room.controller.pos.findInRange(FIND_MY_STRUCTURES, 3, { filter: { structureType: STRUCTURE_LINK }})[0] as StructureLink;
            if (controllerLink && controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                target = controllerLink;
            }
            if (!target) {
                const controllerContainer = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, { filter: { structureType: STRUCTURE_CONTAINER }})[0] as StructureContainer;
                if (controllerContainer && controllerContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    target = controllerContainer;
                }
            }
        }
        if (!target && creep.room.storage && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            target = creep.room.storage;
        }
        if (!target && creep.room.controller) {
            const dropped = creep.room.controller.pos.findInRange(FIND_DROPPED_RESOURCES, 5, { filter: { resourceType: RESOURCE_ENERGY } })[0];
            if (dropped) target = dropped;
        }

        if (target) {
            if (target instanceof Resource) {
                if (creep.pickup(target) === ERR_NOT_IN_RANGE) creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            } else {
                if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            const fallbackSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (fallbackSource) {
                if (creep.harvest(fallbackSource) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(fallbackSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                // No work found — retreat to a parking spot at least 3 blocks away
                const parkingPos = creep.room.storage ? creep.room.storage.pos : (creep.room.controller ? creep.room.controller.pos : undefined);
                StagingUtils.parkCreep(creep, parkingPos);
            }
        }
    }
  }
}
