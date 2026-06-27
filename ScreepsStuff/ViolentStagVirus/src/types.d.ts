// src/types.d.ts

declare global {
  interface CreepStat {
    energyHarvested: number;
    energyUpgraded: number;
    energyBuilt: number;
    damageDealt: number;
    damageHealed: number;
  }

  interface Stats {
    [creepName: string]: CreepStat;
  }

  function leaderboard(metric?: string): string;

  interface Memory {
    uuid: number;
    log: any;
    nameCounters?: { [baseName: string]: number };
    stats?: any; // Grafana telemetry
    empire?: {
      targetExpansionRoom?: string;
      expansionRoomClaimed?: boolean;
      remoteBases?: string[];
      supportTargets?: string[];
      skills?: {
        global?: {
            remoteMiningEnabled?: boolean;
        };
        [roomName: string]: any;
      }; // Dynamically injected constants from AI Harvester
      [key: string]: any;
    };
    ml_telemetry?: {
      lastUpdateTick: number;
      rooms: Record<string, any>;
      empireCreeps: Record<string, number>;
      currentSkills: Record<string, any>;
      cpu: number;
    };


  }

  interface CreepMemory {
    role: string;
    task?: string; 
    working?: boolean;
    // Role specific memory properties
    targetSource?: Id<Source>; 
    targetRoom?: string;
    baseRoom?: string;
    targetId?: Id<Structure | ConstructionSite | Creep | Resource>;
  }

  interface RoomMemory {
    sources?: Id<Source>[];
    mineral?: Id<Mineral>;
    controllerId?: Id<StructureController>;
    remoteRooms?: string[];
    // Outpost threat tracking
    hostileIncidents?: number;  // cumulative invasion count
    lastHostileTick?: number;   // last tick we saw hostiles here
    blacklistedUntil?: number;  // if set, don't use as outpost until this tick
    remoteMiningActive?: boolean; // governor flag: false when storage is full
  }
}

export {};
