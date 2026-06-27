// src/utils/ScavengeUtils.ts
//
// Opportunistic energy scavenging: any creep with free carry can call this
// at the top of their tick to vacuum up nearby dropped energy.
//
// Returns true if the creep acted on dropped energy (so the caller can skip
// their normal logic for that tick if desired, though usually you still let
// them continue their main task).

export class ScavengeUtils {
  /**
   * If the creep has free carry AND there is dropped energy within `range` tiles,
   * pick it up (or step toward it if not adjacent). Does NOT interrupt movement
   * to structure targets — the creep will naturally pass over the pile next tick.
   *
   * @param creep  The creep to scavenge for
   * @param range  Tile radius to scan (1 = only immediately adjacent, no detour)
   */
  public static tryScavengeEnergy(creep: Creep, range: number = 1): boolean {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return false;

    const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, range, {
      filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 10
    })[0];

    if (dropped) {
      if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
        creep.moveTo(dropped, { reusePath: 3, visualizePathStyle: { stroke: '#ffff00' } });
      }
      return true;
    }

    // Also check tombstones (dead creeps leave their carry behind)
    const tombstone = creep.pos.findInRange(FIND_TOMBSTONES, range, {
      filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY) > 10
    })[0];

    if (tombstone) {
      if (creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(tombstone, { reusePath: 3, visualizePathStyle: { stroke: '#ffff00' } });
      }
      return true;
    }

    return false;
  }
}
