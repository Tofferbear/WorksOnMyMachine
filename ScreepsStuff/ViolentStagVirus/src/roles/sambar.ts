// src/roles/sambar.ts

import { IRole } from "./Role";

export class SambarRole implements IRole {
  public roleName = "sambar";

  private _pendingTargetRoom: string | null = null;

  public getPriority(room: Room, counts: any): number {
    return 118;
  }

  public shouldSpawn(room: Room, counts: any): boolean {
    if (Memory.empire?.skills?.global?.remoteMiningEnabled === false) return false;
    if (!room.memory.remoteMiningActive) return false;
    if (!room.memory.remoteRooms || room.memory.remoteRooms.length === 0) return false;

    for (const remoteRoomName of room.memory.remoteRooms) {
      const remoteRoomData = Memory.rooms?.[remoteRoomName];
      if (!remoteRoomData || !remoteRoomData.sources) continue;

      // Skip rooms that have graduated to sovereign bases
      const remoteRoomObj = Game.rooms[remoteRoomName];
      if (remoteRoomObj && remoteRoomObj.find(FIND_MY_SPAWNS).length > 0) continue;

      const javansTargeting = _.filter(Game.creeps, c => c.memory.role === "javan" && c.memory.targetRoom === remoteRoomName);
      const sambarsTargeting = _.filter(Game.creeps, c => c.memory.role === this.roleName && c.memory.targetRoom === remoteRoomName);

      if (sambarsTargeting.length < javansTargeting.length * 2) {
        this._pendingTargetRoom = remoteRoomName;
        return true;
      }
    }
    return false;
  }

  public getInitialMemory(room: Room, counts: any): Partial<CreepMemory> {
    const mem: Partial<CreepMemory> = {
      targetRoom: this._pendingTargetRoom || undefined,
    };
    this._pendingTargetRoom = null;
    return mem;
  }

  public generateBody(energy: number): BodyPartConstant[] {
    // Sambar is a remote hauler. CARRY/MOVE scaled.
    const segment = [CARRY, CARRY, MOVE];
    const cost = 150;
    const count = Math.min(Math.floor(energy / cost), 10);
    let body: BodyPartConstant[] = [];
    for(let i=0; i<Math.max(1, count); i++) body.push(...segment);
    return body;
  }

  public getNewName(): string {
     const names = ["Cargo_Cervid", "Veldt_Van", "Out_Runner", "Relay_0ne", "B0x_Buck", "Sambar_Semi"];
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
    if(!creep.memory.baseRoom) creep.memory.baseRoom = creep.room.name;

    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
        creep.memory.working = false;
        delete creep.memory.targetId;
        creep.say("🔋 pickup");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        delete creep.memory.targetId;
        creep.say("🚚 base");
    }

    if (creep.memory.working) {
        if (creep.room.name !== creep.memory.baseRoom) {
            const route = Game.map.findRoute(creep.room.name, creep.memory.baseRoom);
            if (route !== ERR_NO_PATH && route.length > 0) {
                const exit = creep.pos.findClosestByPath(route[0].exit);
                if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
            }
            return;
        }

        // Anti-Bounce: Step off the exit tile immediately upon entering the destination room!
        if (creep.pos.x === 0 || creep.pos.x === 49 || creep.pos.y === 0 || creep.pos.y === 49) {
            creep.moveTo(new RoomPosition(25, 25, creep.room.name), { maxRooms: 1, range: 20 });
            return;
        }
        
        let target: AnyStructure | null = null;
        if (creep.room.storage && creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            target = creep.room.storage;
        } 
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
        }
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 200
            });
        }
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
        }

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { 
                    visualizePathStyle: { stroke: '#ffffff' },
                    costCallback: (roomName, costMatrix) => {
                        for(let i=0; i<50; i++) { costMatrix.set(0, i, 20); costMatrix.set(49, i, 20); costMatrix.set(i, 0, 20); costMatrix.set(i, 49, 20); }
                        return costMatrix;
                    }
                });
            }
        } else {
            // No delivery targets exist! Park near the controller so we don't block exits.
            const parkingPos = creep.room.controller ? creep.room.controller.pos : undefined;
            if (parkingPos) {
                 if (creep.pos.getRangeTo(parkingPos) > 3) {
                     creep.moveTo(parkingPos, { visualizePathStyle: { stroke: '#ffffff' } });
                 }
            } else {
                 creep.moveTo(new RoomPosition(25, 25, creep.room.name), { maxRooms: 1 });
            }
        }
    } else {
        if (creep.memory.targetRoom && creep.room.name !== creep.memory.targetRoom) {
            const route = Game.map.findRoute(creep.room.name, creep.memory.targetRoom);
            if (route !== ERR_NO_PATH && route.length > 0) {
                const exit = creep.pos.findClosestByPath(route[0].exit);
                if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            return;
        }
        
        // Anti-Bounce: Step off the exit tile immediately upon entering the destination room!
        if (creep.pos.x === 0 || creep.pos.x === 49 || creep.pos.y === 0 || creep.pos.y === 49) {
            creep.moveTo(new RoomPosition(25, 25, creep.room.name), { maxRooms: 1, range: 20 });
            return;
        }

        let lockedTarget = Game.getObjectById(creep.memory.targetId as Id<Resource | StructureContainer>);
        if (lockedTarget) {
            if (lockedTarget instanceof Resource && lockedTarget.amount === 0) lockedTarget = null;
            else if ('store' in lockedTarget && lockedTarget.store.getUsedCapacity(RESOURCE_ENERGY) === 0) lockedTarget = null;
        }

        if (!lockedTarget) {
            lockedTarget = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
            });
            if (!lockedTarget) {
                const containers = creep.room.find(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                }) as StructureContainer[];
                lockedTarget = creep.pos.findClosestByPath(containers);
            }
            if (lockedTarget) creep.memory.targetId = lockedTarget.id;
        }

        if (lockedTarget) {
            if (lockedTarget instanceof Resource) {
                if (creep.pickup(lockedTarget) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(lockedTarget, { 
                        visualizePathStyle: { stroke: '#ffaa00' },
                        costCallback: (roomName, costMatrix) => {
                            for(let i=0; i<50; i++) { costMatrix.set(0, i, 20); costMatrix.set(49, i, 20); costMatrix.set(i, 0, 20); costMatrix.set(i, 49, 20); }
                            return costMatrix;
                        }
                    });
                }
            } else {
                if (creep.withdraw(lockedTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(lockedTarget, { 
                        visualizePathStyle: { stroke: '#ffaa00' },
                        costCallback: (roomName, costMatrix) => {
                            for(let i=0; i<50; i++) { costMatrix.set(0, i, 20); costMatrix.set(49, i, 20); costMatrix.set(i, 0, 20); costMatrix.set(i, 49, 20); }
                            return costMatrix;
                        }
                    });
                }
            }
            return;
        }

        const source = creep.pos.findClosestByPath(FIND_SOURCES);
        if (source) {
            if (creep.pos.getRangeTo(source) > 3) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#cccc00' } });
            }
        }
    }
  }
}
