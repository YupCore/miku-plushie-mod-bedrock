import { world, system, EquipmentSlot, GameMode, Entity } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

function isEntityOnGround(entity: Entity): boolean {
  return entity.isOnGround;
}

// player.isSneaking is unreliable inside event handlers — cache it every tick
const playerSneakState = new Map<string, boolean>();

export function startPlushInteractionSystem(): void {
  console.log("[Miku Plushie] Starting plush interaction system");

  system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      playerSneakState.set(player.id, player.isSneaking);
    }
  }, 1);

  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!player || !target) return;

    if (!PLUSH_ENTITIES.includes(target.typeId as any)) return;
    if (!isEntityOnGround(target)) return;

    const tameable = target.getComponent("minecraft:tameable");
    if (!tameable?.isTamed) return;
    if (tameable.tamedToPlayerId !== player.id) return;

    const isSneaking = playerSneakState.get(player.id) ?? player.isSneaking;

    if (isSneaking) {
      // Tiered drop: mainhand → helmet → chestplate → leggings → boots
      const targetEquippable = target.getComponent("minecraft:equippable");

      if (!targetEquippable) return;

      const dropOrder = [
        EquipmentSlot.Mainhand,
        EquipmentSlot.Head,
        EquipmentSlot.Chest,
        EquipmentSlot.Legs,
        EquipmentSlot.Feet,
      ];

      for (const slot of dropOrder) {
        const slotRef = targetEquippable.getEquipmentSlot(slot);
        if (slotRef?.hasItem()) {
          const item = slotRef.getItem();
          if (item) {
            target.dimension.spawnItem(item, target.location);
            slotRef.setItem(undefined);
          }
          return;
        }
      }
      return;
    }

    const equippable = player.getComponent("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);
    const playerItem = mainhand?.getItem();

    if (playerItem?.typeId === "miku:canudinho") {
      const character = getCharacterFromEntity(target.typeId);
      playPlushSound(target, character, "canudinho", 1, 1);

      const isCreative = player.getGameMode() === GameMode.Creative;
      if (!isCreative) {
        if (mainhand!.amount > 1) {
          mainhand!.amount--;
        } else {
          mainhand!.setItem(undefined);
        }
      }
      return;
    }

    if (playerItem?.typeId === "miku:leek") {
      const character = getCharacterFromEntity(target.typeId);
      target.dimension.playSound("entity.generic.eat", target.location, {
        volume: 1,
        pitch: 1,
      });
      playPlushSound(target, character, "eat", 1, 1);
      return;
    }

    // Default: toggle sit (any item or empty hand)
    target.triggerEvent("miku:toggle_sit");
  });
}
