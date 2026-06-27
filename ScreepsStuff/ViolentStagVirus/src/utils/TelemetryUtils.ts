// src/utils/TelemetryUtils.ts

export class TelemetryUtils {
  public static exportGrafanaStats(): void {
      if (!Memory.stats) {
          Memory.stats = {};
      }

      // Reset base payload for the tick
      const stats: any = {
          time: Game.time,
          cpu: {
              bucket: Game.cpu.bucket,
              limit: Game.cpu.limit,
              tickLimit: Game.cpu.tickLimit,
              getUsed: Game.cpu.getUsed() // Will be slightly lower than actual total since it's scraped here
          },
          gcl: {
              level: Game.gcl.level,
              progress: Game.gcl.progress,
              progressTotal: Game.gcl.progressTotal
          },
          creeps: Object.keys(Game.creeps).length,
          rooms: {}
      };

      // Room-specific metrics
      for (const roomName in Game.rooms) {
          const room = Game.rooms[roomName];
          if (room.controller && room.controller.my) {
              stats.rooms[roomName] = {
                  level: room.controller.level,
                  controllerProgress: room.controller.progress,
                  controllerProgressTotal: room.controller.progressTotal,
                  energyAvailable: room.energyAvailable,
                  energyCapacityAvailable: room.energyCapacityAvailable,
                  storageEnergy: room.storage ? room.storage.store.getUsedCapacity(RESOURCE_ENERGY) : 0,
                  terminalEnergy: room.terminal ? room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) : 0,
                  hostiles: room.find(FIND_HOSTILE_CREEPS).length,
                  constructionSites: room.find(FIND_MY_CONSTRUCTION_SITES).length
              };
          }
      }

      // Assign to global memory so the Grafana parser can scrape it
      Memory.stats = stats;
  }
}
