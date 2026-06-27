// src/main.ts
import "./roles"; // MUST BE FIRST: Register all modular roles before anything else loads
console.log(`[🚀 BOOT] Role Registry Initialized. Entering Manager setup...`);

import { HerdManager } from "./managers/HerdManager";
import { MetricsUtils } from "./utils/MetricsUtils";
import { TelemetryUtils } from "./utils/TelemetryUtils";

const DEPLOYMENT_TIME = Date.now();
console.log(`[🚀 DEPLOYMENT] Code successfully updated and synchronized! Timestamp: ${DEPLOYMENT_TIME}`);

/**
 * Global initialization
 */
if (Memory.uuid === undefined) {
  Memory.uuid = 0;
  // Initialize other top-level memory props here
  Memory.empire = {};
}
MetricsUtils.initMetrics();
MetricsUtils.setupLeaderboardGlobal();

const herdManager = new HerdManager();

export function loop(): void {
  // 1. Run the main orchestrator
  herdManager.run();

  // 2. Clean up memory
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
      console.log(`Clearing non-existing creep memory: ${name}`);
    }
  }

  // 3. Compile Grafana Telemetry (do this dead last so CPU tracking is mostly accurate)
  TelemetryUtils.exportGrafanaStats();
}
