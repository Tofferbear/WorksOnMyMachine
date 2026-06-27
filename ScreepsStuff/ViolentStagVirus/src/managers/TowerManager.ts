// src/managers/TowerManager.ts

export class TowerManager {
  public run(room: Room): void {
    const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER
    });

    if (towers.length === 0) return;

    // Hostiles target
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    
    // Damaged creeps
    const damagedCreeps = room.find(FIND_MY_CREEPS, {
      filter: (c) => c.hits < c.hitsMax
    });

    // Determine dynamic rampart target hitpoints based on room storage
    let rampartTarget = 10000;
    if (room.storage) {
        const stored = room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
        if (stored > 200000) rampartTarget = 1000000;
        else if (stored > 100000) rampartTarget = 300000;
        else if (stored > 50000) rampartTarget = 100000;
        else rampartTarget = 25000;
    }

    // Damaged structures (excluding walls/ramparts over a threshold to save energy if attacked)
    const damagedStructures = room.find(FIND_STRUCTURES, {
      filter: (s) => {
        if (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) {
          return s.hits < rampartTarget; 
        }
        return s.hits < s.hitsMax;
      }
    });

    for (const tower of towers) {
      if (hostiles.length > 0) {
        const target = tower.pos.findClosestByRange(hostiles);
        if (target) tower.attack(target);
      } else if (damagedCreeps.length > 0) {
        const target = tower.pos.findClosestByRange(damagedCreeps);
        if (target) tower.heal(target);
      } else if (damagedStructures.length > 0 && tower.store.getUsedCapacity(RESOURCE_ENERGY) > tower.store.getCapacity(RESOURCE_ENERGY) * 0.5) {
        // Only repair if tower has > 50% energy to save for attacks
        const target = tower.pos.findClosestByRange(damagedStructures);
        if (target) tower.repair(target);
      }
    }
  }
}
