// src/roles/sika.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";

export class SikaRole implements IRole {
  public roleName = "sika";

  public getPriority(room: Room, counts: any): number {
    return 150;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    const extractor = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTRACTOR } })[0];
    const mineral = room.find(FIND_MINERALS)[0];
    
    if (extractor && mineral && mineral.mineralAmount > 0) {
      const limit = Memory.empire?.skills?.[room.name]?.sikaLimit ?? 1;
      const existing = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.room.name === room.name);
      return existing.length < limit;
    }
    return false;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // Sika is a mineral miner. Requires WORK/CARRY/MOVE.
    const cost = 250; // WORK(100) + CARRY(50) + MOVE(100) - wait, WORK is 100, CARRY 50, MOVE 50 = 200
    const segment = [WORK, CARRY, MOVE];
    const count = Math.min(Math.floor(energy / 200), 10);
    let body: BodyPartConstant[] = [];
    for(let i=0; i<Math.max(1, count); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Crystal_Crest", "Geode_Glider", "V vein_Vanguard", "Gem_Gazer", "Strata_Stag", "Mine_Meister"];
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
        creep.say("⛏️ mine");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say("🚚 haul");
    }

    if (creep.memory.working) {
        const target = creep.room.terminal || creep.room.storage;
        if (target) {
            for (const resourceType in creep.store) {
                if (creep.transfer(target, resourceType as ResourceConstant) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: "#da61ff" } });
                    break; 
                }
            }
        }
    } else {
        const mineral = creep.room.find(FIND_MINERALS)[0];
        if (mineral) {
            if (mineral.mineralAmount > 0) {
                const harvestResult = creep.harvest(mineral);
                if (harvestResult === ERR_NOT_IN_RANGE) {
                    creep.moveTo(mineral, { visualizePathStyle: { stroke: "#ffaa00" } });
                } else if (harvestResult === OK) {
                    MetricsUtils.recordStat(creep.name, "energyHarvested", creep.getActiveBodyparts(WORK) * HARVEST_MINERAL_POWER);
                }
            } else {
                if (creep.room.storage) creep.moveTo(creep.room.storage, { range: 3 });
            }
        }
    }
  }
}
