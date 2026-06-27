// src/roles/wapiti.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";
import { ScavengeUtils } from "../utils/ScavengeUtils";
import { StagingUtils } from "../utils/StagingUtils";
import { ConstructUtils } from "../utils/ConstructUtils";

export class WapitiRole implements IRole {
  public roleName = "wapiti";

  public getPriority(room: Room, counts: any): number {
    return 100;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (constructionSites.length === 0) return false;

    const storageMinForBuilding = 20000;
    const canBuild = !room.storage || room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > storageMinForBuilding;
    if (!canBuild) return false;

    const limit = Memory.empire?.skills?.[room.name]?.wapitiLimit ?? 2;
    return counts.wapiti < limit;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // 12: WORK, CARRY, MOVE scaled
    const segment = [WORK, CARRY, MOVE];
    const cost = 200;
    const numSegments = Math.min(Math.floor(energy / cost), 8);
    let body: BodyPartConstant[] = [];
    for (let i = 0; i < Math.max(1, numSegments); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Wapiti_Jax", "Cerv1n_D066er", "W00d_Pudu", "Not_A_Beaver", "TippyTines", "0h_D33r"];
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
        creep.say("📡 wait");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say("🔨 construct");
    }

    ScavengeUtils.tryScavengeEnergy(creep, 1);

    if (creep.memory.working) {
        let site = ConstructUtils.getPrioritySite(creep);

        if (site) {
            if (creep.build(site) === ERR_NOT_IN_RANGE) {
                creep.moveTo(site, { visualizePathStyle: { stroke: "#ffffff" } });
            } else {
                MetricsUtils.recordStat(creep.name, "energyBuilt", creep.getActiveBodyparts(WORK) * BUILD_POWER);
            }
        } else {
            // No work found — retreat to a parking spot at least 3 blocks away
            const parkingPos = creep.room.storage ? creep.room.storage.pos : undefined;
            StagingUtils.parkCreep(creep, parkingPos);
        }
    } else {
        let target: AnyStructure | Resource | null = null;
        if (creep.room.storage && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            target = creep.room.storage;
        } else if (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            target = creep.room.terminal;
        } else {
           const containers = creep.room.find(FIND_STRUCTURES, {
               filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 50
           }) as StructureContainer[];
           target = creep.pos.findClosestByPath(containers);
        }

        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                 creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
            });
            if (dropped) {
               if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
                   creep.moveTo(dropped, { visualizePathStyle: { stroke: '#ffaa00' } });
               }
            } else {
               const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
               if (source) {
                   if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                       creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                   }
               } else {
                   // No pickup found — retreat to a parking spot
                   const parkingPos = creep.room.storage ? creep.room.storage.pos : undefined;
                   StagingUtils.parkCreep(creep, parkingPos);
               }
            }
        }
    }
  }
}
