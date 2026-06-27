// src/managers/HerdSupportManager.ts

export class HerdSupportManager {
  public run(): void {
    if (!Memory.empire) Memory.empire = {};
    if (!Memory.empire.supportTargets) Memory.empire.supportTargets = [];
    
    // Evaluate every 10 ticks to save CPU
    if (Game.time % 10 !== 0) return;

    const newSupportTargets: string[] = [];

    // Find all sovereign rooms (rooms with our controller and at least one of our spawns)
    const sovereignRooms = Object.values(Game.rooms).filter(r => r.controller && r.controller.my && r.find(FIND_MY_SPAWNS).length > 0);

    for (const room of sovereignRooms) {
        // We count essential workers that consider this room their home
        const localCreeps = _.filter(Game.creeps, c => c.memory.baseRoom === room.name);
        
        // If local population crashed to almost 0, it needs support
        if (localCreeps.length < 2) {
            newSupportTargets.push(room.name);
            console.log(`[HerdSupport] 🚨 EMERGENCY: Sovereign base ${room.name} has critically low population (${localCreeps.length}). Requesting rescue dispatch!`);
        }
    }

    Memory.empire.supportTargets = newSupportTargets;
  }
}
