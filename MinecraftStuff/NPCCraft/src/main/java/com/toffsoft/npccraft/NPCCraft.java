package com.toffsoft.npccraft;

import com.mojang.brigadier.CommandDispatcher;
import com.mojang.logging.LogUtils;
import com.toffsoft.npccraft.entity.NPCPlayerEntity;

import java.util.Optional;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.Commands;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.ResourceKey;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.npc.Villager;
import net.minecraft.world.entity.npc.VillagerProfession;
import net.minecraftforge.event.RegisterCommandsEvent;
import net.minecraftforge.event.entity.EntityAttributeCreationEvent;
import net.minecraftforge.event.server.ServerStartingEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;
import net.minecraftforge.registries.DeferredRegister;
import net.minecraftforge.registries.ForgeRegistries;
import net.minecraftforge.registries.RegistryObject;

import org.slf4j.Logger;

@Mod(NPCCraft.MODID)
public class NPCCraft {
    public static final String MODID = "npccraft";
    private static final Logger LOGGER = LogUtils.getLogger();

    public static final DeferredRegister<EntityType<?>> ENTITY_TYPES =
    DeferredRegister.create(ForgeRegistries.ENTITY_TYPES, MODID);

    public static final RegistryObject<EntityType<NPCPlayerEntity>> NPC_PLAYER =
        ENTITY_TYPES.register("npc_player", () ->
            (EntityType<NPCPlayerEntity>)EntityType.Builder.<NPCPlayerEntity>of(NPCPlayerEntity::new, MobCategory.MISC)
                .sized(0.6F, 1.8F)
                .build(ResourceKey.create(Registries.ENTITY_TYPE, ResourceLocation.tryParse(MODID + ":npc_player")))
        );

    public NPCCraft() {
        ENTITY_TYPES.register(FMLJavaModLoadingContext.get().getModEventBus());
        net.minecraftforge.common.MinecraftForge.EVENT_BUS.register(this);
    }

    public static String getModVersion() {
        return NPCCraft.class.getPackage().getImplementationVersion();
    }

    @SubscribeEvent
    public void onRegisterCommands(RegisterCommandsEvent event) {
        CommandDispatcher<CommandSourceStack> dispatcher = event.getDispatcher();

        dispatcher.register(
            Commands.literal("spawnnpc")
                .executes(ctx -> {
                    ServerLevel world = ctx.getSource().getLevel();
                    BlockPos pos = BlockPos.containing(ctx.getSource().getPosition());
                    // String profession = ctx.getArgument("profession", net.minecraft.resources.ResourceLocation.class).toString();
                    spawnNpc(world, pos);
                    ctx.getSource().sendSuccess(() -> net.minecraft.network.chat.Component.literal("Spawned NPC"), false);
                    return 1;
                })
        );
    }

    @SubscribeEvent
    public void onServerStarting(ServerStartingEvent event) {
        LOGGER.info("NPC Craft version: %s starting...".formatted(getModVersion()));
    }

    @SubscribeEvent
    public void onEntityAttributeCreation(EntityAttributeCreationEvent event) {
        LOGGER.info("Registering attributes for NPC_PLAYER");
        event.put(NPC_PLAYER.get(), NPCPlayerEntity.createAttributes().build());
    }

    public static void spawnNpc(ServerLevel world, BlockPos pos) {
    // public static void spawnNpc(ServerLevel world, BlockPos pos, String profession) {
        // Villager villager = EntityType.VILLAGER.spawn(
        //     world,
        //     null,
        //     null,
        //     pos,
        //     EntitySpawnReason.EVENT,
        //     false,
        //     false);
        
        // if (villager != null) {
        //     villager.setPos(pos.getX() + 0.5, pos.getY(), pos.getZ() + 0.5);
        //     Optional<Holder.Reference<VillagerProfession>> professionHolder = BuiltInRegistries.VILLAGER_PROFESSION.get(ResourceLocation.tryParse(profession));
            
        //     if (professionHolder.isPresent()) {
        //         villager.setVillagerData(
        //             villager.getVillagerData().withProfession(professionHolder.get())
        //         );
        //     } else {
        //         LOGGER.warn("Unknown profession: {}", profession);
        //     }

        //     world.addFreshEntity(villager);
        // }

        try {
            NPCPlayerEntity npc = NPC_PLAYER.get().create(
                world,
                null, // No custom spawn consumer
                pos,
                EntitySpawnReason.EVENT,
                false, // alignPosition
                false  // invertY
            );

            if (npc != null) {
                npc.setPos(pos.getX() + 0.5, pos.getY(), pos.getZ() + 0.5);
                world.addFreshEntity(npc);
            } else {
                LOGGER.warn("Failed to spawn NPCPlayerEntity at {}", pos);
            }
        }
        catch (Exception e) {
            LOGGER.error("Error spawning NPCPlayerEntity at {}: {}", pos, e.getMessage(), e);
        }
    }
}
