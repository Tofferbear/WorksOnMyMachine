package com.toffsoft.npccraft.entity;

import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.Mob;
// import net.minecraft.world.entity.MobType;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.level.Level;

public class NPCPlayerEntity extends Mob {
    public NPCPlayerEntity(EntityType<? extends Mob> entityType, Level level) {
        super(entityType, level);
    }

    // @Override
    // public MobType getMobType() {
    //     return MobType.HUMAN;
    // }

    // Set up basic attributes (health, speed, etc.)
    public static AttributeSupplier.Builder createAttributes() {
        return Mob.createMobAttributes()
            .add(Attributes.MAX_HEALTH, 20.0D)
            .add(Attributes.MOVEMENT_SPEED, 0.3D);
    }
}
