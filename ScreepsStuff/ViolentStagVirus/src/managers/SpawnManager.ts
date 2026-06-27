import { RoleRegistry } from "../roles/RoleRegistry";

export class SpawnManager {
  public run(room: Room): void {
    const spawns = room.find(FIND_MY_SPAWNS, {
      filter: spawn => !spawn.spawning
    });

    if (spawns.length === 0) return;
    const spawn = spawns[0];
    const energy = room.energyCapacityAvailable;
    const currentEnergy = room.energyAvailable;

    // Filter creeps only once: match current room, target room, OR base of origin
    const creeps = _.filter(Game.creeps, c => 
      c.room.name === room.name || 
      c.memory.targetRoom === room.name || 
      c.memory.baseRoom === room.name
    );

    // Dynamic counts for all roles in RoleRegistry
    const counts: any = {};
    RoleRegistry.getAllRoles().forEach(role => {
      counts[role.roleName] = _.filter(creeps, c => c.memory.role === role.roleName).length;
    });

    // --- MODULAR PRIORITY LOOP ---
    const sortedRoles = RoleRegistry.getSortedRoles(room, counts);
    for (const role of sortedRoles) {
      if (role.shouldSpawn(room, counts)) {
        // Handle emergency/bootstrap energy thresholds
        // WE ARE IN EMERGENCY IF:
        // No local miners (Stag/Buck) AND No local haulers (Mule/Oryx)
        const hasNoLocalSupport = (counts["mule"] || 0) === 0 && (counts["oryx"] || 0) === 0;
        const hasNoLocalMiners = (counts["stag"] || 0) === 0 && (counts["buck"] || 0) === 0;
        
        // If we are truly extinct locally, use current energy (min 300) to get a bootstrap unit out.
        // Otherwise, wait for full capacity to spawn efficient units.
        const isExtinction = hasNoLocalSupport || (hasNoLocalMiners && (counts["javan"] || 0) === 0);
        const energyToUse = (isExtinction) ? Math.max(300, currentEnergy) : energy;

        if (this.spawnCreep(spawn, role, energyToUse, counts)) return;
      }
    }
  }

  private spawnCreep(spawn: StructureSpawn, role: any, energy: number, counts: any): boolean {
    const name = role.getNewName();
    const body = role.generateBody(energy);
    
    if (body.length === 0) return false;

    // Base memory
    const memory: CreepMemory = { 
      role: role.roleName, 
      working: false,
      baseRoom: spawn.room.name 
    };

    // Role-specific initial memory (e.g., targetRoom, targetSource)
    const initialMem = role.getInitialMemory ? role.getInitialMemory(spawn.room, counts) : {};
    Object.assign(memory, initialMem);

    const result = spawn.spawnCreep(body, name, { memory });
    if (result === OK) {
      console.log(`[SpawnManager] Room ${spawn.room.name} spawning ${role.roleName}: ${name}`);
      return true;
    } else if (result === ERR_BUSY || result === ERR_NOT_ENOUGH_ENERGY) {
      // Halt the queue to wait for spawn availability or energy
      return true; 
    } else {
      console.log(`Failed to spawn ${role.roleName}. Error: ${result}`);
    }
    return false;
  }
}
