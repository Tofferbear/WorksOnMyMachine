// src/managers/RemoteMiningManager.ts

import { SpawnManager } from "./SpawnManager";

// How many distinct invasion events before we cut our losses and abandon the room.
const HOSTILE_INCIDENT_THRESHOLD = 3;
// Minimum ticks between two incidents counting separately (avoids one long invasion = many counts).
const INCIDENT_COOLDOWN_TICKS = 500;
// How long (ticks) to blacklist an abandoned outpost before reconsidering it.
const BLACKLIST_DURATION_TICKS = 10_000;

// Storage governor: suspend remote mining above this fill fraction, resume below the lower one.
// This frees spawn capacity for Elk upgraders when the tank is full.
const STORAGE_SUSPEND_THRESHOLD = 0.95; // 95% full  → stop spawning Javans/Sambars
const STORAGE_RESUME_THRESHOLD  = 0.85; // 85% full  → restart remote mining

export class RemoteMiningManager {
  // Spawning for remote roles is now handled autonomously by JavanRole and SambarRole

  public run(baseRoom: Room): void {
    if (baseRoom.controller!.level < 3) return; // Wait until RCL 3 for outposts

    // Initialize list of outposts for this room
    if (!baseRoom.memory.remoteRooms) {
      baseRoom.memory.remoteRooms = [];
    }

    // --- Home-Room First Bootstrap ---
    // If we have critical infrastructure under construction in our own room,
    // suspend ALL remote mining support until our room is stable!
    const criticalHomeSites = baseRoom.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: s => s.structureType === STRUCTURE_LINK ||
                     s.structureType === STRUCTURE_CONTAINER ||
                     s.structureType === STRUCTURE_SPAWN ||
                     s.structureType === STRUCTURE_STORAGE
    });
    if (criticalHomeSites.length > 0 && baseRoom.controller!.level < 6) {
        // Only do this for rooms still bootstrapping (RCL < 6)
        return; // Wait until home-room basics are built.
    }

    // --- Threat Assessment: check visible outpost rooms for hostiles ---
    this.assessOutpostThreats(baseRoom);

    // Very naive auto-assign outpost (just pick adjacent room with recorded sources)
    // Skip rooms that are currently blacklisted.
    if (baseRoom.memory.remoteRooms.length < baseRoom.controller!.level - 2) {
       if (Memory.rooms) {
           const exits = Object.values(Game.map.describeExits(baseRoom.name));
           for (const exit of exits) {
               const isBase = Memory.empire?.remoteBases?.includes(exit);
               if (Memory.rooms[exit] && Memory.rooms[exit].sources && !isBase && !baseRoom.memory.remoteRooms.includes(exit)) {
                   // Skip blacklisted rooms (unless the blacklist has expired)
                   const blacklistedUntil = Memory.rooms[exit].blacklistedUntil;
                   if (blacklistedUntil && Game.time < blacklistedUntil) {
                       console.log(`[RemoteMining] Skipping ${exit} - blacklisted for ${blacklistedUntil - Game.time} more ticks.`);
                       continue;
                   }
                   // Ensure it's not owned by someone else
                   if (Memory.rooms[exit].controllerId) {
                      const ctrl = Game.getObjectById(Memory.rooms[exit].controllerId as Id<StructureController>);
                      if (ctrl && (ctrl.owner || ctrl.reservation?.username !== "Tofferbear")) continue; 
                   }
                   baseRoom.memory.remoteRooms.push(exit);
                   console.log(`[RemoteMining] Assigned ${exit} as outpost for ${baseRoom.name}`);
                   break;
               }
           }
       }
    }

    // Manage creeps for each remote room (Logic for Stats/Flags only)
    for (const remoteRoomName of baseRoom.memory.remoteRooms) {
       const remoteRoomData = Memory.rooms?.[remoteRoomName];
       if (!remoteRoomData || !remoteRoomData.sources) continue;

       // --- Storage Governor ---
       // When home storage is nearly full, suspend Javan miners and Sambar haulers.
       // Persist suspended state in room memory to implement hysteresis
       const storageCapacity = baseRoom.storage?.store.getCapacity(RESOURCE_ENERGY) ?? 1;
       const storageUsed = baseRoom.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
       const storageFill = storageUsed / storageCapacity;

       if (!baseRoom.memory.remoteMiningActive) baseRoom.memory.remoteMiningActive = true;
       if (storageFill >= STORAGE_SUSPEND_THRESHOLD) {
           if (baseRoom.memory.remoteMiningActive) {
               console.log(`[RemoteMining] Storage at ${Math.round(storageFill * 100)}% — suspending Javans/Sambars. Upgraders take priority.`);
               baseRoom.memory.remoteMiningActive = false;
           }
       } else if (storageFill < STORAGE_RESUME_THRESHOLD) {
           if (!baseRoom.memory.remoteMiningActive) {
               console.log(`[RemoteMining] Storage at ${Math.round(storageFill * 100)}% — resuming remote mining.`);
               baseRoom.memory.remoteMiningActive = true;
           }
       }
    }
    
    // Purge graduated bases from outposts
    if (baseRoom.memory.remoteRooms) {
        baseRoom.memory.remoteRooms = baseRoom.memory.remoteRooms.filter(roomName => {
            const r = Game.rooms[roomName];
            // If we have vision and we own the controller, it is no longer an outpost!
            if (r && r.controller && r.controller.my) {
                console.log(`[RemoteMining] Removing ${roomName} from ${baseRoom.name} outposts because it is now a Sovereign Base!`);
                return false; 
            }
            return true;
        });
    }

    if (Game.time % 100 === 0) {
        this.placeInfrastructure(baseRoom);
    }
  }

  /**
   * Checks all registered outpost rooms for hostile activity.
   * Each distinct invasion window (separated by INCIDENT_COOLDOWN_TICKS) increments
   * the hostileIncidents counter. Once that counter hits HOSTILE_INCIDENT_THRESHOLD,
   * we cut our losses:
   *   1. Remove the room from remoteRooms
   *   2. Blacklist it for BLACKLIST_DURATION_TICKS
   *   3. Recall all creeps assigned to it so they stop dying there
   */
  private assessOutpostThreats(baseRoom: Room): void {
    if (!baseRoom.memory.remoteRooms) return;

    const roomsToAbandon: string[] = [];

    for (const remoteRoomName of baseRoom.memory.remoteRooms) {
      const remoteRoom = Game.rooms[remoteRoomName];
      if (!remoteRoom) continue; // No vision — can't assess

      if (!Memory.rooms) Memory.rooms = {};
      if (!Memory.rooms[remoteRoomName]) Memory.rooms[remoteRoomName] = {};
      const roomMem = Memory.rooms[remoteRoomName];

      const hostiles = remoteRoom.find(FIND_HOSTILE_CREEPS, {
        filter: c => c.getActiveBodyparts(ATTACK) > 0 ||
                     c.getActiveBodyparts(RANGED_ATTACK) > 0 ||
                     c.getActiveBodyparts(WORK) > 0
      });
      const invaderCores = remoteRoom.find(FIND_HOSTILE_STRUCTURES, {
        filter: { structureType: STRUCTURE_INVADER_CORE }
      });

      const hasThreats = hostiles.length > 0 || invaderCores.length > 0;

      if (hasThreats) {
        const lastTick = roomMem.lastHostileTick ?? 0;
        // Only count as a new incident if enough time has passed since the last one
        if (Game.time - lastTick > INCIDENT_COOLDOWN_TICKS) {
          roomMem.hostileIncidents = (roomMem.hostileIncidents ?? 0) + 1;
          console.log(`[RemoteMining] Hostile incident #${roomMem.hostileIncidents} recorded in ${remoteRoomName}.`);
        }
        roomMem.lastHostileTick = Game.time;

        if ((roomMem.hostileIncidents ?? 0) >= HOSTILE_INCIDENT_THRESHOLD) {
          roomsToAbandon.push(remoteRoomName);
        }
      }
    }

    for (const roomName of roomsToAbandon) {
      // Remove from active outpost list
      baseRoom.memory.remoteRooms = baseRoom.memory.remoteRooms!.filter(r => r !== roomName);

      // Blacklist so we don't immediately reassign it
      if (!Memory.rooms[roomName]) Memory.rooms[roomName] = {};
      Memory.rooms[roomName].blacklistedUntil = Game.time + BLACKLIST_DURATION_TICKS;
      Memory.rooms[roomName].hostileIncidents = 0; // Reset for when the blacklist expires

      console.log(`[RemoteMining] ABANDONING ${roomName} after repeated invasions. Blacklisted for ${BLACKLIST_DURATION_TICKS} ticks.`);

      // Recall all creeps assigned to this outpost — let them return home naturally
      for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.targetRoom === roomName) {
          delete creep.memory.targetRoom;
          delete creep.memory.targetSource;
          console.log(`[RemoteMining] Recalling ${creep.name} (${creep.memory.role}) from abandoned outpost ${roomName}.`);
        }
      }
    }
  }

  private placeInfrastructure(baseRoom: Room): void {
      const spawn = baseRoom.find(FIND_MY_SPAWNS)[0];
      if (!spawn) return;
      
      let globalSitesCount = Object.keys(Game.constructionSites).length;

      for (const remoteRoomName of baseRoom.memory.remoteRooms || []) {
          const remoteRoom = Game.rooms[remoteRoomName];
          if (!remoteRoom) continue; // Requires active vision

          const sources = remoteRoom.find(FIND_SOURCES);
          for (const source of sources) {
              // 1. Container Placement
              const containers = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER }});
              const sites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, { filter: { structureType: STRUCTURE_CONTAINER }});
              
              if (containers.length === 0 && sites.length === 0) {
                  let placed = false;
                  for (let dx = -1; dx <= 1 && !placed; dx++) {
                      for (let dy = -1; dy <= 1 && !placed; dy++) {
                          if (dx === 0 && dy === 0) continue;
                          const x = source.pos.x + dx;
                          const y = source.pos.y + dy;
                          const terrain = Game.map.getRoomTerrain(remoteRoomName);
                          if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                              if (remoteRoom.createConstructionSite(x, y, STRUCTURE_CONTAINER) === OK) {
                                  placed = true;
                                  globalSitesCount++;
                              }
                          }
                      }
                  }
              }

              // 2. Highway Paving (Throttled)
              if (globalSitesCount < 60) {
                  const ret = PathFinder.search(spawn.pos, { pos: source.pos, range: 1 }, {
                      plainCost: 2,
                      swampCost: 4, 
                      roomCallback: (roomName) => {
                          const room = Game.rooms[roomName];
                          if (!room) return false; // Don't path through blind rooms
                          
                          const costs = new PathFinder.CostMatrix();
                          room.find(FIND_STRUCTURES).forEach(s => {
                              if (s.structureType === STRUCTURE_ROAD) {
                                  costs.set(s.pos.x, s.pos.y, 1);
                              } else if (s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_RAMPART) {
                                  costs.set(s.pos.x, s.pos.y, 255); // Avoid buildings
                              }
                          });
                          return costs;
                      }
                  });

                  for (const step of ret.path) {
                      if (globalSitesCount >= 60) break; // Strict throttle
                      const stepRoom = Game.rooms[step.roomName];
                      if (stepRoom) {
                          const hasRoad = stepRoom.lookForAt(LOOK_STRUCTURES, step.x, step.y).some(s => s.structureType === STRUCTURE_ROAD);
                          const hasSite = stepRoom.lookForAt(LOOK_CONSTRUCTION_SITES, step.x, step.y).length > 0;
                          if (!hasRoad && !hasSite) {
                              if (stepRoom.createConstructionSite(step.x, step.y, STRUCTURE_ROAD) === OK) {
                                  globalSitesCount++;
                              }
                          }
                      }
                  }
              }
          }
      }
  }
}
