// src/roles/buck.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";

export class BuckRole implements IRole {
  public roleName = "buck";

  public getPriority(room: Room, counts: any): number {
    if (counts.buck < 1 && room.controller && room.controller.level >= 2) return 2; // Emergency Bootstrap Priority
    if (room.controller && room.controller.level >= 2) return 80;
    return 999;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    if (room.controller && room.controller.level >= 2) {
        const sources = room.find(FIND_SOURCES);
        return counts.buck < sources.length;
    }
    return false;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // Needs 1 CARRY part (50) and 1 MOVE part (50) to function with links/containers
    const energyForWork = energy - BODYPART_COST[MOVE] - BODYPART_COST[CARRY];
    const numWorkParts = Math.min(Math.floor(energyForWork / BODYPART_COST[WORK]), 5); // Max 5 work for normal source
    return [MOVE, CARRY, ...Array(Math.max(1, numWorkParts)).fill(WORK)];
  }

  public getNewName(): string {
     const names = ["Buckley_Stagg", "R0e_Buckman", "Sten_B0k", "V3nny_Sonn", "12_Point", "Vel0ci_Hart", "AntlerNet_Prime", "Buckline_Protocol", "Blep_Buck"];
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
    // Assign a source if not already assigned
    if (!creep.memory.targetSource) {
      const sources = creep.room.find(FIND_SOURCES);
      const otherBucks = _.filter(Game.creeps, c => c.memory.role === "buck" && c.room.name === creep.room.name);
      for (const source of sources) {
        const targeted = _.filter(otherBucks, b => b.memory.targetSource === source.id).length;
        if (targeted === 0) { creep.memory.targetSource = source.id; break; }
      }
      if (!creep.memory.targetSource) creep.memory.targetSource = sources[0].id;
    }

    const source = Game.getObjectById(creep.memory.targetSource as Id<Source>);
    if (!source) return;

    // --- POSITIONING ---
    const sourceLink = source.pos.findInRange(FIND_MY_STRUCTURES, 1, {
      filter: { structureType: STRUCTURE_LINK }
    })[0] as StructureLink | undefined;
    const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: { structureType: STRUCTURE_CONTAINER }
    })[0] as StructureContainer | undefined;

    let targetPos: RoomPosition = container ? container.pos : (sourceLink ? sourceLink.pos : source.pos);
    const range = container ? 0 : 1;

    const inPosition = (container && creep.pos.isEqualTo(container.pos)) || 
                       (!container && sourceLink && creep.pos.isNearTo(sourceLink) && creep.pos.isNearTo(source)) ||
                       (!container && !sourceLink && creep.pos.isNearTo(source));

    if (!inPosition) {
      creep.moveTo(targetPos, { visualizePathStyle: { stroke: '#ffaa00' }, range });
      return;
    }

    // --- HARVEST & TRANSFER ---
    const harvestResult = creep.harvest(source);
    if (harvestResult === OK) {
        MetricsUtils.recordStat(creep.name, "energyHarvested", creep.getActiveBodyparts(WORK) * HARVEST_POWER);
        creep.say("⛏️ dig");
    }

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      const linkHasSpace = sourceLink && sourceLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      const containerHasSpace = container && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0;

      if (linkHasSpace) {
        creep.transfer(sourceLink as StructureLink, RESOURCE_ENERGY);
        creep.say("⚡ link");
      } else if (containerHasSpace) {
        creep.transfer(container as StructureContainer, RESOURCE_ENERGY);
        creep.say("📦 store");
      } else if (!sourceLink && !container) {
         creep.drop(RESOURCE_ENERGY);
         creep.say("💧 drop");
      }
    }

    // Build container if needed
    const site = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: { structureType: STRUCTURE_CONTAINER }
    })[0];
    if (site && creep.pos.isEqualTo(site.pos)) {
      creep.build(site);
      creep.say("🔨 build");
      MetricsUtils.recordStat(creep.name, "energyBuilt", creep.getActiveBodyparts(WORK) * BUILD_POWER);
    }
  }
}
