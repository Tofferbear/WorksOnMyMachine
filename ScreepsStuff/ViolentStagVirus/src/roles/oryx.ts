// src/roles/oryx.ts

import { IRole } from "./Role";
import { StagingUtils } from "../utils/StagingUtils";

export class OryxRole implements IRole {
  public roleName = "oryx";

  public getPriority(room: Room, counts: any): number {
    if (counts.oryx < 1 && (counts.buck > 0 || counts.stag > 0)) return 4;
    if (counts.oryx < 2) return 140;
    return 999;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    if (counts.oryx < 1 && (counts.buck > 0 || counts.stag > 0)) return true;
    
    const limit = Math.max(1, Memory.empire?.skills?.[room.name]?.oryxLimit ?? 2); // Hard floor of 1
    if (counts.oryx < limit) return true;
    return false;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // 10: CARRY, CARRY, MOVE scaled
    const segment = [CARRY, CARRY, MOVE];
    const cost = 150;
    const numSegments = Math.min(Math.floor(energy / cost), 8);
    let body: BodyPartConstant[] = [];
    for (let i = 0; i < Math.max(1, numSegments); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Sun_Dancer", "Dune_Strider", "Scorch_Horn", "Desert_Ghost", "Solar_Flare", "Heat_Wave"];
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
    
    if (creep.room.name !== creep.memory.baseRoom) {
        delete creep.memory.targetId;
        creep.memory.working = false;
        const route = Game.map.findRoute(creep.room.name, creep.memory.baseRoom);
        if (route !== ERR_NO_PATH && route.length > 0) {
            const exit = creep.pos.findClosestByPath(route[0].exit);
            if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        return;
    }

    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
        creep.memory.working = false;
        creep.say("⚡ charge");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say("🔋 fill");
    }

    if (creep.memory.working) {
        let target: AnyStructure | null = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) => {
                if (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) {
                    return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
                if (s.structureType === STRUCTURE_TOWER) {
                    return s.store.getFreeCapacity(RESOURCE_ENERGY) > s.store.getCapacity(RESOURCE_ENERGY) * 0.2;
                }
                return false;
            }
        });

        if (!target && creep.room.controller) {
            const controllerContainer = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
                   filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            })[0] as StructureContainer;
            if (controllerContainer) {
                target = controllerContainer;
            }
        }

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else {
            // No work found — retreat to a parking spot at least 3 blocks away
            const parkingPos = creep.room.storage ? creep.room.storage.pos : undefined;
            StagingUtils.parkCreep(creep, parkingPos);
        }
    } else {
        let sourceTarget: AnyStructure | Resource | null = null;
        if (creep.room.storage && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            sourceTarget = creep.room.storage;
        } 
        else if (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            sourceTarget = creep.room.terminal;
        }
        
        if (!sourceTarget) {
           const containers = creep.room.find(FIND_STRUCTURES, {
               filter: s => {
                   if (s.structureType !== STRUCTURE_CONTAINER || s.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return false;
                   // Logic: Don't withdraw from containers next to the controller! (Those are Sinks)
                   if (creep.room.controller && s.pos.getRangeTo(creep.room.controller) <= 3) return false;
                   return true;
               }
           }) as StructureContainer[];
           sourceTarget = creep.pos.findClosestByPath(containers);
        }

        if (!sourceTarget) {
            sourceTarget = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
            });
        }

        if (sourceTarget) {
            if (sourceTarget instanceof Resource) {
               if (creep.pickup(sourceTarget) === ERR_NOT_IN_RANGE) {
                   creep.moveTo(sourceTarget, { visualizePathStyle: { stroke: '#ffaa00' } });
               }
            } else {
                if (creep.withdraw(sourceTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sourceTarget, { visualizePathStyle: { stroke: '#ffaa00' } });
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
