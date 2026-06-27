// src/roles/RoleRegistry.ts

import { IRole } from "./Role";

export class RoleRegistry {
  private static _roles: { [roleName: string]: IRole } = {};

  /**
   * Register a new role with the system.
   */
  public static register(role: IRole): void {
    this._roles[role.roleName] = role;
  }

  /**
   * Get a specific role by name.
   */
  public static getRole(roleName: string): IRole | undefined {
    return this._roles[roleName];
  }

  /**
   * Get all registered roles, sorted by priority for the given room.
   */
  public static getSortedRoles(room: Room, counts: any): IRole[] {
    return Object.values(this._roles).sort((a, b) => {
      return a.getPriority(room, counts) - b.getPriority(room, counts);
    });
  }

  /**
   * Get all registered roles.
   */
  public static getAllRoles(): IRole[] {
    return Object.values(this._roles);
  }

  /**
   * Get the full list of registered role names.
   */
  public static getRoleNames(): string[] {
    return Object.keys(this._roles);
  }
}
