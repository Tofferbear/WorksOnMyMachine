// src/utils/ConstructUtils.ts

export class ConstructUtils {
    /**
     * Standard priority for all construction in the empire.
     * Lower numbers = Higher priority.
     */
    public static readonly PRIORITY: Record<string, number> = {
        [STRUCTURE_SPAWN]: 1,
        [STRUCTURE_CONTAINER]: 2,
        [STRUCTURE_TOWER]: 3,
        [STRUCTURE_EXTENSION]: 4,
        [STRUCTURE_STORAGE]: 5,
        [STRUCTURE_LINK]: 6,
        [STRUCTURE_TERMINAL]: 7,
        [STRUCTURE_EXTRACTOR]: 8,
        [STRUCTURE_LAB]: 9,
        [STRUCTURE_ROAD]: 10,
        [STRUCTURE_WALL]: 11,
        [STRUCTURE_RAMPART]: 12
    };

    /**
     * Find the highest priority construction site for a creep.
     */
    public static getPrioritySite(creep: Creep): ConstructionSite | null {
        const sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        if (sites.length === 0) return null;

        // Group sites by their priority level
        const highestPriorityValue = Math.min(...sites.map(s => this.PRIORITY[s.structureType] ?? 99));
        
        // Return the closest site within that priority tier
        const prioritySites = sites.filter(s => (this.PRIORITY[s.structureType] ?? 99) === highestPriorityValue);
        return creep.pos.findClosestByPath(prioritySites) || prioritySites[0];
    }
}
