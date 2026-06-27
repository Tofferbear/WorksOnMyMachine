// src/roles/moose.ts

import { IRole } from "./Role";
import { MetricsUtils } from "../utils/MetricsUtils";

export class MooseRole implements IRole {
  public roleName = "moose";

  private _pendingTargetRoom: string | null = null;
  private _isReactive: boolean = false;

  public getPriority(room: Room, counts: any): number {
    return this._isReactive ? 10 : 120;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    // 1. Check local room
    const hostiles = room.find(FIND_HOSTILE_CREEPS, {
        filter: c => c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0 || c.getActiveBodyparts(WORK) > 0
    });
    const hostileCores = room.find(FIND_HOSTILE_STRUCTURES, { filter: { structureType: STRUCTURE_INVADER_CORE } });
    
    if (hostiles.length > 0 || hostileCores.length > 0) {
      const existing = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === room.name);
      const limit = Memory.empire?.skills?.[room.name]?.militaryLimit ?? 2;
      if (existing.length < limit) {
        this._pendingTargetRoom = room.name;
        this._isReactive = true;
        return true;
      }
    }

    // 2. Check remote outposts
    if (room.memory.remoteRooms) {
      for (const remoteRoomName of room.memory.remoteRooms) {
        const remoteRoom = Game.rooms[remoteRoomName];
        if (!remoteRoom) continue;

        const rHostiles = remoteRoom.find(FIND_HOSTILE_CREEPS, {
            filter: c => c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0 || c.getActiveBodyparts(WORK) > 0
        });
        const rCores = remoteRoom.find(FIND_HOSTILE_STRUCTURES, { filter: { structureType: STRUCTURE_INVADER_CORE } });
        
        const existingRem = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === remoteRoomName);

        const limit = Memory.empire?.skills?.[remoteRoomName]?.militaryLimit ?? 2;
        if (rHostiles.length > 0 || rCores.length > 0) {
          if (existingRem.length < limit) {
            this._pendingTargetRoom = remoteRoomName;
            this._isReactive = true;
            return true;
          }
        } else {
          // Garrison: 1 Moose in each outpost
          if (existingRem.length < 1) {
            this._pendingTargetRoom = remoteRoomName;
            this._isReactive = false;
            return true;
          }
        }
      }
    }
    return false;
  }

  public getInitialMemory(room: Room, counts: any): Partial<CreepMemory> {
    const mem: Partial<CreepMemory> = {
      targetRoom: this._pendingTargetRoom || undefined,
    };
    this._pendingTargetRoom = null;
    this._isReactive = false;
    return mem;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // Moose is a fighter. TOUGH/ATTACK/MOVE.
    // Cost: TOUGH (10) + ATTACK (80) + MOVE (50) = 140
    const segment = [TOUGH, ATTACK, MOVE];
    const cost = 140;
    const count = Math.min(Math.floor(energy / cost), 15);
    let body: BodyPartConstant[] = [];
    for(let i=0; i<Math.max(1, count); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Forest_Guard", "Iron_Antler", "Bellow_King", "Wall_Stopper", "Crest_Knight", "Moss_Marauder"];
     return this.generateName(names);
  }

  private generateName(nameList: string[]): string {
    if (!Memory.nameCounters) Memory.nameCounters = {};
    const livingBaseNames = _.filter(Game.creeps, c => c.memory.role === this.roleName)
                             .map(c => c.name.split('_')[0]);
    const availableNames = nameList.filter(name => !livingBaseNames.includes(name));
    const baseName = availableNames.length > 0 
        ? availableNames[Math.floor(Math.random() * availableNames.length)]
        : nameList[Math.floor(Math.random() * nameList.length)];

    Memory.nameCounters[baseName] = (Memory.nameCounters[baseName] || 0) + 1;
    return `${baseName}_${Memory.nameCounters[baseName]} (${this.roleName.charAt(0).toUpperCase() + this.roleName.slice(1)})`;
  }

  public run(creep: Creep): void {
    const targetRoom = creep.memory.targetRoom;
    
    if (targetRoom && creep.room.name !== targetRoom) {
        const route = Game.map.findRoute(creep.room.name, targetRoom);
        if (route !== ERR_NO_PATH && route.length > 0) {
            const exit = creep.pos.findClosestByPath(route[0].exit);
            if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        return;
    }

    const hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (hostile) {
        creep.say("⚔️ charge");
        if (creep.attack(hostile) === ERR_NOT_IN_RANGE) {
            creep.moveTo(hostile, { visualizePathStyle: { stroke: '#ff0000' } });
        } else {
            MetricsUtils.recordStat(creep.name, "damageDealt", creep.getActiveBodyparts(ATTACK) * ATTACK_POWER);
        }
    } else {
        const hostileCore = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { 
            filter: { structureType: STRUCTURE_INVADER_CORE }
        });
        
        if (hostileCore) {
            creep.say("⚔️ bash");
            if (creep.attack(hostileCore) === ERR_NOT_IN_RANGE) {
                creep.moveTo(hostileCore, { visualizePathStyle: { stroke: '#ff0000' } });
            } else {
                MetricsUtils.recordStat(creep.name, "damageDealt", creep.getActiveBodyparts(ATTACK) * ATTACK_POWER);
            }
        } else {
            creep.say("🛡️ guard");
            const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
            if (spawn) {
                if (creep.pos.getRangeTo(spawn) > 3) {
                    creep.moveTo(spawn, { range: 3, visualizePathStyle: { stroke: '#00ff00', lineStyle: 'dotted' } });
                }
            }
        }
    }
  }
}
