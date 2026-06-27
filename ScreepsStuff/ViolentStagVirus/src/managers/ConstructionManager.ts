// src/managers/ConstructionManager.ts

export class ConstructionManager {
  private getExtensionOffsets(): [number, number][] {
      const offsets: [number, number][] = [];
      for (let dx = -8; dx <= 8; dx++) {
          for (let dy = -8; dy <= 8; dy++) {
              if (dx === 0 && dy === 0) continue;
              // Leave cardinal exit lanes empty for roads (Range 2)
              if ((Math.abs(dx) <= 2 && dy === 0) || (Math.abs(dy) <= 2 && dx === 0)) continue;
              // Reserve tower spots (center.x - 1, center.y + 2 etc in run loop)
              if (dx === -1 && dy === 2) continue;
              if (dx === 1 && dy === 2) continue;
              // Reserve storage spot
              if (dx === 0 && dy === -1) continue;

              // Open Grid pattern (Strict even parity for Manhattan corridors)
              // This leaves a 1-tile gap in all cardinal directions
              if (Math.abs(dx) % 2 === 0 && Math.abs(dy) % 2 === 0) {
                  offsets.push([dx, dy]);
              }
          }
      }
      // Sort circularly by Euclidean distance
      offsets.sort((a, b) => (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1]));
      return offsets;
  }

  public run(room: Room): void {
    const spawns = room.find(FIND_MY_SPAWNS);
    const hasNoSpawn = spawns.length === 0;
    const level = room.controller?.level || 0;

    // Check for "Core Infrastructure" gaps (Storage, Towers, Containers)
    const hasStorage = room.storage != null || room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_STORAGE }}).length > 0;
    const towerCount = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][level] || 0;
    const currentTowers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }).length;
    const towerSites = room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_TOWER } }).length;
    const needsTowers = towerCount > (currentTowers + towerSites);

    const sources = room.find(FIND_SOURCES);
    let missingContainers = false;
    if (level >= 2) {
      for (const source of sources) {
        const containers = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } });
        const sites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, { filter: { structureType: STRUCTURE_CONTAINER } });
        if (containers.length === 0 && sites.length === 0) {
            missingContainers = true;
            break;
        }
      }
    }

    const needsHighPriority = hasNoSpawn || (level >= 4 && !hasStorage) || needsTowers || missingContainers;
    
    // Only run full check every 100 ticks for stable rooms, but every 10 ticks for new or incomplete colonies
    if (needsHighPriority ? Game.time % 10 !== 0 : Game.time % 100 !== 0) return;
    if (!room.controller || !room.controller.my) return;

    // 0. Place Spawn — highest priority for new rooms with no spawn yet
    if (spawns.length === 0) {
      const spawnSites = room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_SPAWN } });
      if (spawnSites.length === 0) {
        // Calculate the next available Lodge name
        const lodgeCount = Object.values(Game.spawns).filter(s => s.name.startsWith("The_Lodge")).length;
        const newName = `The_Lodge_${lodgeCount + 1}`;

        // Find a valid spot near the center - expanding search radius
        const found = this.placeStructureNear(room, new RoomPosition(25, 25, room.name) as any, STRUCTURE_SPAWN, 15, newName);
        if (found) {
            console.log(`[ConstructionManager] Successfully placed Spawn blueprint: ${newName} in ${room.name}`);
        } else {
            console.log(`[ConstructionManager] 🛑 FAILED to find valid Spawn spot in ${room.name}! Search radius exhausted.`);
        }
      }
      return; // Nothing else to do until the spawn is built
    }

    const center = spawns[0].pos;

    // 1. Place Storage — MUST come before Extensions at RCL 4+.
    //    Storage unlocks the Oryx recharge chain and the storage governor.
    if (level >= 4 && !room.storage) {
        const storageSites = room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_STORAGE }});
        if (storageSites.length === 0) {
            // Try preferred spot (center.y - 2), then search nearby
            const preferred = new RoomPosition(center.x, center.y - 2, room.name);
            if (room.createConstructionSite(preferred, STRUCTURE_STORAGE) === OK) {
                console.log(`[ConstructionManager] Placing Storage in ${room.name}`);
                return;
            } else if (this.placeStructureNear(room, center, STRUCTURE_STORAGE, 3)) {
                console.log(`[ConstructionManager] Placing Storage (alternative spot) in ${room.name}`);
                return;
            }
        }
    }

    // 2. Place Extensions (cap at 10 pending sites to avoid flooding the global 100-site limit)
    const extCount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][level];
    const currentExt = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }).length;
    const extSites = room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_EXTENSION } }).length;
    
    let neededExt = Math.min(extCount - (currentExt + extSites), 10 - extSites); // Never queue more than 10 at once
    if (neededExt > 0) {
      const offsets = this.getExtensionOffsets();
      for (const offset of offsets) {
        if (neededExt <= 0) break;
        const x = center.x + offset[0];
        const y = center.y + offset[1];
        if (x > 1 && x < 48 && y > 1 && y < 48) {
          if (room.createConstructionSite(x, y, STRUCTURE_EXTENSION) === OK) {
            neededExt--;
          }
        }
      }
    }

    // 3. Place Containers (At sources and controller) - Continue even if extensions were placed
    if (level >= 2) {
      const sources = room.find(FIND_SOURCES);
      for (const source of sources) {
        const containers = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } });
        const sites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, { filter: { structureType: STRUCTURE_CONTAINER } });
        if (containers.length === 0 && sites.length === 0) {
            if (this.placeStructureNear(room, source.pos, STRUCTURE_CONTAINER, 1)) {
                console.log(`[ConstructionManager] Placing Container at source in ${room.name}`);
            }
        }
      }
      
      const controllerContainers = room.controller.pos.findInRange(FIND_STRUCTURES, 2, { filter: { structureType: STRUCTURE_CONTAINER } });
      const controllerSites = room.controller.pos.findInRange(FIND_CONSTRUCTION_SITES, 2, { filter: { structureType: STRUCTURE_CONTAINER } });
      if (controllerContainers.length === 0 && controllerSites.length === 0) {
          if (this.placeStructureNear(room, room.controller.pos, STRUCTURE_CONTAINER, 2)) {
              console.log(`[ConstructionManager] Placing Container at controller in ${room.name}`);
          }
      }
    }

    // 3. Place Towers
    if (level >= 3) {
      const towerCount = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][level];
      const currentTowers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }).length;
      const towerSites = room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_TOWER } }).length;
      
      let neededTowers = towerCount - (currentTowers + towerSites);
      if (neededTowers > 0) {
         // Search for a valid spot near the spawn/center
         if (this.placeStructureNear(room, center, STRUCTURE_TOWER, 3)) {
             console.log(`[ConstructionManager] Placing Tower in ${room.name}`);
         }
      }
    }

    // 5. Place Roads
    // Simple heuristic: path from spawn to sources and controller
    if (level >= 3) {
      const allRoadSites = room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_ROAD }});
      if (allRoadSites.length < 5) {
        const sources = room.find(FIND_SOURCES);
        for (const source of sources) {
           const path = room.findPath(center, source.pos, { ignoreCreeps: true, range: 1 });
           for (const step of path) {
              room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
           }
        }
        const ctrlPath = room.findPath(center, room.controller.pos, { ignoreCreeps: true, range: 1 });
        for (const step of ctrlPath) {
           room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
        }
      }
    }

    // 6. Place Rampart Shells (Protect Critical Infrastructure)
    if (level >= 3) {
        const protectTypes = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL];
        const criticalStructures = room.find(FIND_MY_STRUCTURES, {
            filter: s => protectTypes.includes(s.structureType as any)
        });
        
        for (const struct of criticalStructures) {
            const ramparts = struct.pos.findInRange(FIND_MY_STRUCTURES, 0, {
                filter: { structureType: STRUCTURE_RAMPART }
            });
            const rampartSites = struct.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 0, {
                filter: { structureType: STRUCTURE_RAMPART }
            });
            
            if (ramparts.length === 0 && rampartSites.length === 0) {
                room.createConstructionSite(struct.pos, STRUCTURE_RAMPART);
            }
        }
    }

    // 7. Place Links (Energy Teleportation Network)
    if (level >= 5) {
        const linkCount = CONTROLLER_STRUCTURES[STRUCTURE_LINK][level];
        const currentLinks = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } }).length;
        const linkSites = room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_LINK } }).length;
        let neededLinks = linkCount - (currentLinks + linkSites);

        if (neededLinks > 0) {
            // Priority 1: Storage/Hub Link (near center)
            const storageLinks = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK && s.pos.inRangeTo(center, 3) });
            const storageSites = room.find(FIND_CONSTRUCTION_SITES, { filter: s => s.structureType === STRUCTURE_LINK && s.pos.inRangeTo(center, 3) });
            if (storageLinks.length === 0 && storageSites.length === 0 && neededLinks > 0) {
                 if (this.placeStructureNear(room, center, STRUCTURE_LINK, 2)) neededLinks--;
            }

            // Priority 2: Controller Link
            if (neededLinks > 0) {
                 const ctrlLinks = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK && s.pos.inRangeTo(room.controller!.pos, 3) });
                 const ctrlSites = room.find(FIND_CONSTRUCTION_SITES, { filter: s => s.structureType === STRUCTURE_LINK && s.pos.inRangeTo(room.controller!.pos, 3) });
                 if (ctrlLinks.length === 0 && ctrlSites.length === 0 && neededLinks > 0) {
                      if (this.placeStructureNear(room, room.controller!.pos, STRUCTURE_LINK, 2)) neededLinks--;
                 }
            }
            
            // Priority 3: Source Links (Unlocks further at RCL 6+)
            // MUST be range=1 (directly adjacent to source) so Bucks can deposit
            // without moving — otherwise the link defeats its own purpose.
            if (neededLinks > 0 && level >= 6) {
                const sources = room.find(FIND_SOURCES);
                for (const source of sources) {
                    if (neededLinks <= 0) break;
                    const sourceLinks = source.pos.findInRange(FIND_MY_STRUCTURES, 1, { filter: { structureType: STRUCTURE_LINK } });
                    const sourceSites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, { filter: { structureType: STRUCTURE_LINK } });
                    if (sourceLinks.length === 0 && sourceSites.length === 0) {
                        if (this.placeStructureNear(room, source.pos, STRUCTURE_LINK, 1)) neededLinks--;
                    }
                }
            }
        }
    }

    // 8. Place Terminal (RCL 6)
    if (level >= 6 && !room.terminal) {
        const terminalSites = room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_TERMINAL }});
        if (terminalSites.length === 0) {
            // Place near storage/hub
            const anchor = room.storage ? room.storage.pos : center;
            if (this.placeStructureNear(room, anchor, STRUCTURE_TERMINAL, 2)) {
                console.log(`[ConstructionManager] Placing Terminal in ${room.name}`);
            }
        }
    }

    // 9. Place Extractor (RCL 6)
    if (level >= 6) {
        const mineral = room.find(FIND_MINERALS)[0];
        if (mineral) {
            const hasExtractor = mineral.pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType === STRUCTURE_EXTRACTOR);
            const hasSite = mineral.pos.lookFor(LOOK_CONSTRUCTION_SITES).some(s => s.structureType === STRUCTURE_EXTRACTOR);
            if (!hasExtractor && !hasSite) {
                room.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
                console.log(`[ConstructionManager] Placing Extractor in ${room.name}`);
            }
        }
    }
  }

  private placeStructureNear(room: Room, pos: RoomPosition, structureType: BuildableStructureConstant, range: number = 1, name?: string): boolean {
      for (let dx = -range; dx <= range; dx++) {
          for (let dy = -range; dy <= range; dy++) {
              if (dx === 0 && dy === 0) continue;
              const x = pos.x + dx;
              const y = pos.y + dy;
              
              if (x < 2 || x > 47 || y < 2 || y > 47) continue;

              const terrain = Game.map.getRoomTerrain(room.name);
              // Avoid building in walls
              if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                  // Hard check if it's completely empty
                  const existingPos = new RoomPosition(x, y, room.name);
                  const structures = existingPos.lookFor(LOOK_STRUCTURES);
                  const sites = existingPos.lookFor(LOOK_CONSTRUCTION_SITES);
                  
                  // Allow placing structures on top of roads or ramparts, but not other structures
                  const hasBlockingStructure = structures.some(s => s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_RAMPART);
                  
                  if (!hasBlockingStructure && sites.length === 0) {
                      // TypeScript overload handling: only spawns can have custom names
                      const result = (structureType === STRUCTURE_SPAWN)
                          ? room.createConstructionSite(x, y, STRUCTURE_SPAWN, name)
                          : room.createConstructionSite(x, y, structureType);
                      
                      if (result === OK) return true;
                  }
              }
          }
      }
      return false;
  }
}
