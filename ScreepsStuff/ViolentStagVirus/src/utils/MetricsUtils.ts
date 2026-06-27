// src/utils/MetricsUtils.ts

export class MetricsUtils {
  public static initMetrics(): void {
    if (!Memory.stats) {
      Memory.stats = {};
    }
  }

  public static recordStat(creepName: string, statType: keyof CreepStat, amount: number): void {
    if (!Memory.stats) return;
    if (!Memory.stats[creepName]) {
      Memory.stats[creepName] = {
        energyHarvested: 0,
        energyUpgraded: 0,
        energyBuilt: 0,
        damageDealt: 0,
        damageHealed: 0
      };
    }
    (Memory.stats[creepName] as any)[statType] += amount;
  }

  public static setupLeaderboardGlobal(): void {
    global.leaderboard = function (metric: string = "energyHarvested"): string {
      if (!Memory.stats) {
        return "No stats collected yet.";
      }

      const sorted = Object.keys(Memory.stats).sort(
        (a, b) => ((Memory.stats![b] as any)[metric] || 0) - ((Memory.stats![a] as any)[metric] || 0)
      );

      console.log(`--- 🦌 ${(metric as string).toUpperCase()} Leaderboard 🦌 ---`);
      sorted.slice(0, 5).forEach((name, index) => {
        const value = (Memory.stats![name] as any)[metric] || 0;
        if (value > 0) {
          console.log(`${index + 1}. ${name}: ${value.toFixed(0)}`);
        }
      });

      return "Leaderboard printed to console.";
    };
  }

  public static exportTelemetry(): void {
      if (Game.time % 10 !== 0) return; // Only update every 10 ticks to save CPU

      if (!Memory.ml_telemetry) {
          Memory.ml_telemetry = {
              lastUpdateTick: 0,
              rooms: {},
              empireCreeps: {},
              currentSkills: {},
              cpu: 0
          };
      }

      // Aggregate global creep roles
      const creepCounts = _.countBy(Game.creeps, c => c.memory.role);
      
      const roomsState: Record<string, any> = {};
      
      for (const roomName in Game.rooms) {
          const room = Game.rooms[roomName];
          if (!room.controller || !room.controller.my) continue;

          roomsState[roomName] = {
              rcl: room.controller.level,
              rclProgress: room.controller.progress,
              rclTotal: room.controller.progressTotal,
              energyAvailable: room.energyAvailable,
              energyCapacity: room.energyCapacityAvailable,
              storageLevel: room.storage ? room.storage.store.getUsedCapacity(RESOURCE_ENERGY) : 0,
              constructionCount: room.find(FIND_MY_CONSTRUCTION_SITES).length,
              hostileIncidents: room.memory.hostileIncidents || 0,
              hostileCreeps: room.find(FIND_HOSTILE_CREEPS).length,
              ticksToDowngrade: room.controller.ticksToDowngrade,
              remoteRoomsTargeted: room.memory.remoteRooms?.length || 0,
              remoteMiningActive: room.memory.remoteMiningActive || false
          };
      }

      Memory.ml_telemetry = {
          lastUpdateTick: Game.time,
          rooms: roomsState,
          empireCreeps: creepCounts,
          currentSkills: Memory.empire?.skills || {},
          cpu: Game.cpu.getUsed()
      };
  }
}
