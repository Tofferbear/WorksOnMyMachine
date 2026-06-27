// src/roles/mule.ts

import { IRole } from "./Role";
import { ScavengeUtils } from "../utils/ScavengeUtils";
import { StagingUtils } from "../utils/StagingUtils";

export class MuleRole implements IRole {
  public roleName = "mule";

  public getPriority(room: Room, counts: any): number {
    if (counts.mule < 1 && (counts.buck > 0 || counts.stag > 0)) return 3; // Emergency Bootstrap Priority
    const sources = room.find(FIND_SOURCES).length;
    if (counts.mule < sources) return 90; // Min haulers
    if (counts.mule < sources * 2) return 120; // Desired haulers
    return 999;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    const sources = room.find(FIND_SOURCES).length;
    const limit = Memory.empire?.skills?.[room.name]?.muleLimit ?? (sources * 2);
    return counts.mule < limit;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // 8: CARRY, CARRY, MOVE scaled
    const segment = [CARRY, CARRY, MOVE];
    const cost = 150;
    const numSegments = Math.min(Math.floor(energy / cost), 10);
    let body: BodyPartConstant[] = [];
    for (let i = 0; i < Math.max(1, numSegments); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
    const names = ["Imp_Pala", "Pr0ng_Horn", "Veldt_Eland", "Jack_Ass", "Cervid_Unit_K47", "Bramble_Boop"];
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
    if (!creep.memory.baseRoom) creep.memory.baseRoom = creep.room.name;
    
    // Strict Boundary Enforcement
    if (creep.room.name !== creep.memory.baseRoom) {
        delete creep.memory.targetId; // Clear any erroneous cross-room locks
        creep.memory.working = false; // Reset to pickup phase
        const route = Game.map.findRoute(creep.room.name, creep.memory.baseRoom);
        if (route !== ERR_NO_PATH && route.length > 0) {
            const exit = creep.pos.findClosestByPath(route[0].exit);
            if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        return;
    }

    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
        creep.memory.working = false;
        delete creep.memory.targetId;
        creep.say("🔋 pickup");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        delete creep.memory.targetId;
        creep.say("🚚 deliver");
    }

    ScavengeUtils.tryScavengeEnergy(creep, 3);

    if (creep.memory.working) {
        let target: AnyStructure | null = null;
        
        const oryxCount = _.filter(Game.creeps, c => c.memory.role === "oryx" && (c.memory.baseRoom === creep.room.name || c.room.name === creep.room.name)).length;
        if (oryxCount === 0) {
            target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
        }

        if (!target && creep.room.storage) {
            const storageLink = creep.room.storage.pos.findInRange(FIND_MY_STRUCTURES, 3, {
                filter: s => s.structureType === STRUCTURE_LINK && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            })[0] as StructureLink;
            if (storageLink) {
                target = storageLink;
            }
        }
        if (!target && creep.room.storage && creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            target = creep.room.storage;
        } 
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
        }

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else {
           if (creep.room.controller) {
               const controllerContainer = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
                   filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
               })[0];
               if (controllerContainer) {
                   if (creep.transfer(controllerContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                       creep.moveTo(controllerContainer, { visualizePathStyle: { stroke: '#ffffff' } });
                   }
                   return;
               }
           }
           // No work found — retreat to a parking spot at least 3 blocks away
           const parkingPos = creep.room.storage ? creep.room.storage.pos : undefined;
           StagingUtils.parkCreep(creep, parkingPos);
        }
    } else {
        let lockedTarget = Game.getObjectById(creep.memory.targetId as Id<Resource | StructureContainer>);
        if (lockedTarget) {
            if (lockedTarget instanceof Resource && lockedTarget.amount === 0) lockedTarget = null;
            else if ('store' in lockedTarget && lockedTarget.store.getUsedCapacity(RESOURCE_ENERGY) === 0) lockedTarget = null;
        }

        if (!lockedTarget) {
            lockedTarget = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
            });
            if (!lockedTarget) {
                const containers = creep.room.find(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER && 
                                 s.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
                                 s.pos.findInRange(FIND_SOURCES, 2).length > 0
                }) as StructureContainer[];
                lockedTarget = creep.pos.findClosestByPath(containers);
            }
            if (lockedTarget) creep.memory.targetId = lockedTarget.id;
        }

        if (lockedTarget) {
            if (lockedTarget instanceof Resource) {
                if (creep.pickup(lockedTarget) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(lockedTarget, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                if (creep.withdraw(lockedTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(lockedTarget, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        } else {
            // No pickup found — retreat to a parking spot
            const parkingPos = creep.room.storage ? creep.room.storage.pos : undefined;
            StagingUtils.parkCreep(creep, parkingPos);
        }
    }
  }
}
