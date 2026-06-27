// src/managers/HerdManager.ts

import { SpawnManager } from "./SpawnManager";
import { ConstructionManager } from "./ConstructionManager";
import { TowerManager } from "./TowerManager";
import { LinkManager } from "./LinkManager";
import { RemoteMiningManager } from "./RemoteMiningManager";
import { HerdExpansionManager } from "./HerdExpansionManager";
import { HerdSupportManager } from "./HerdSupportManager";
import { MilitaryOperationsManager } from "./MilitaryOperationsManager";
import { ClientVisualsManager } from "./ClientVisualsManager";
import { MarketManager } from "./MarketManager";
import { MetricsUtils } from "../utils/MetricsUtils";

import { RoleRegistry } from "../roles/RoleRegistry";

export class HerdManager {
  private spawnManager = new SpawnManager();
  private constructionManager = new ConstructionManager();
  private towerManager = new TowerManager();
  private linkManager = new LinkManager();
  private remoteMiningManager = new RemoteMiningManager();
  private herdExpansionManager = new HerdExpansionManager();
  private herdSupportManager = new HerdSupportManager();
  private militaryOpsManager = new MilitaryOperationsManager();
  private visualsManager = new ClientVisualsManager();
  private marketManager = new MarketManager();

  public run(): void {
    // 1. Run Empire-level Managers
    this.herdExpansionManager.run();
    this.herdSupportManager.run();
    this.militaryOpsManager.run();

    // 2. Run Room-level Managers
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        try {
          this.spawnManager.run(room);
          this.constructionManager.run(room);
          this.towerManager.run(room);
          this.linkManager.run(room);
          this.remoteMiningManager.run(room);
          this.marketManager.run(room);
        } catch (e: any) {
          console.log(`[HerdManager] 🛑 Room Manager Crash in ${roomName}: ${e.message}\n${e.stack}`);
        }
      }
      this.visualsManager.run(room);
    }

    // 3. Run Creep Logic
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.spawning) continue;

      try {
        const modularRole = RoleRegistry.getRole(creep.memory.role);
        if (modularRole) {
          modularRole.run(creep);
        } else {
          console.log(`[HerdManager] ⚠️ Unknown role: ${creep.memory.role} on ${creep.name}`);
        }
      } catch (e: any) {
        console.log(`[HerdManager] 🛑 Error running creep ${creep.name}: ${e.message}\n${e.stack}`);
      }
    }

    // 4. Export Machine Learning Telemetry
    MetricsUtils.exportTelemetry();
  }
}
