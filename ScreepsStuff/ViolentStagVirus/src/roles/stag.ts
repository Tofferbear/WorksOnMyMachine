// src/roles/stag.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";
import { ScavengeUtils } from "../utils/ScavengeUtils";

export class StagRole implements IRole {
  public roleName = "stag";

  public getPriority(room: Room, counts: any): number {
    const hasNoProducers = counts.stag === 0 && counts.buck === 0 && counts.javan === 0;
    if (hasNoProducers) return 1; // Emergency!
    if (room.controller && room.controller.level === 1) return 60; // Baseline for RCL 1
    return 999; // Not normally used at higher RCL
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    const hasNoProducers = counts.stag === 0 && counts.buck === 0 && counts.javan === 0;
    if (hasNoProducers) return true;
    
    const limit = Math.max(1, Memory.empire?.skills?.[room.name]?.stagLimit ?? 4); // Hard floor of 1
    if (room.controller && room.controller.level === 1 && counts.stag < limit) return true;
    return false;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // 1: WORK, CARRY, MOVE (Basic Worker) scaled
    const segment = [WORK, CARRY, MOVE];
    const cost = 200;
    const numSegments = Math.min(Math.floor(energy / cost), 10);
    let body: BodyPartConstant[] = [];
    for (let i = 0; i < Math.max(1, numSegments); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     // Names from NameUtils (absorbed locally)
     const names = ["MntJck_St4g", "F4wn_Kashm1r", "Small_Ch1tAll", "Veldt_Spr1ng", "F4wn_S3r4ph", "Lil_Sp00k_Fawn", "FawnD00dle", "Spriggy_Stag"];
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
        creep.say("🦌 harvest");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say("💼 work");
    }

    ScavengeUtils.tryScavengeEnergy(creep, 1);

    if (creep.memory.working) {
        // 1. Fill extensions and spawns
        const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
            return;
        }

        // 2. Build
        const sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        let site: ConstructionSite | null = null;
        
        if (sites.length > 0) {
            const priority: Record<string, number> = {
                [STRUCTURE_TOWER]: 1,
                [STRUCTURE_SPAWN]: 2,
                [STRUCTURE_EXTENSION]: 3,
                [STRUCTURE_CONTAINER]: 4,
                [STRUCTURE_STORAGE]: 5,
                [STRUCTURE_LINK]: 6,
                [STRUCTURE_ROAD]: 10,
                [STRUCTURE_WALL]: 11,
                [STRUCTURE_RAMPART]: 12
            };
            
            const highestPriority = Math.min(...sites.map(s => priority[s.structureType] ?? 99));
            const prioritySites = sites.filter(s => (priority[s.structureType] ?? 99) === highestPriority);
            
            site = creep.pos.findClosestByPath(prioritySites) || prioritySites[0];
        }

        if (site) {
            if (creep.build(site) === ERR_NOT_IN_RANGE) {
                creep.moveTo(site, { visualizePathStyle: { stroke: "#ffffff" } });
            } else {
                MetricsUtils.recordStat(creep.name, "energyBuilt", creep.getActiveBodyparts(WORK) * BUILD_POWER);
            }
            return;
        }

        // 3. Upgrade
        if (creep.room.controller) {
            const result = creep.upgradeController(creep.room.controller);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#48ff00" } });
            } else if (result === OK) {
                MetricsUtils.recordStat(creep.name, "energyUpgraded", creep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER);
            }
        }
    } else {
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (source) {
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
            } else {
                MetricsUtils.recordStat(creep.name, "energyHarvested", creep.getActiveBodyparts(WORK) * HARVEST_POWER);
            }
        }
    }
  }
}
