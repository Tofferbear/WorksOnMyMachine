// src/utils/AntiBounceUtils.ts

export class AntiBounceUtils {
    /**
     * If a creep is standing exactly on a room exit tile (x=0, x=49, y=0, y=49),
     * it is at high risk of the Screeps "Border Oscillation Bug" where pathfinding
     * to a target inside the room forces it to walk along the exit tiles, accidentally
     * triggering a transition back to the previous room.
     * 
     * This utility intercepts logic and forces the creep to take a direct step toward
     * the center of the room to clear the boundary safely.
     * 
     * @returns true if anti-bounce movement was applied (creep should halt other actions)
     */
    public static clearBoundary(creep: Creep): boolean {
        const x = creep.pos.x;
        const y = creep.pos.y;

        if (x === 0 || x === 49 || y === 0 || y === 49) {
            // Force the creep to move toward the center of the room to clear the exit
            creep.moveTo(new RoomPosition(25, 25, creep.room.name), {
                visualizePathStyle: { stroke: '#ff0000', lineStyle: 'dashed' },
                reusePath: 0 // Don't cache this emergency step
            });
            creep.say("🚷 clear");
            return true;
        }
        return false;
    }
}
