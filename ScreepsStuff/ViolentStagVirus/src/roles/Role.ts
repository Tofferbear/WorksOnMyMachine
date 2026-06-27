// src/roles/Role.ts

export interface IRole {
  roleName: string;
  
  /**
   * Spawning priority. Lower numbers are spawned first.
   * Can be a static number or a dynamic function of the room state.
   */
  getPriority(room: Room, counts: any): number;

  /**
   * Determine if the room currently needs this role.
   */
  shouldSpawn(room: Room, counts: any): boolean;

  /**
   * Generate the body parts for this creep based on available energy.
   */
  generateBody(energy: number): BodyPartConstant[];

  /**
   * Generate a unique name for this creep.
   */
  getNewName(): string;

  /**
   * The core logic loop for a creep of this role.
   */
  run(creep: Creep): void;

  /**
   * Optional: Provide additional memory data for the creep at spawn time.
   * Useful for remote roles that need targetRoom or targetSource immediately.
   */
  getInitialMemory?(room: Room, counts: any): Partial<CreepMemory>;
}
