import { world, EquipmentSlot, GameMode, Entity } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

function isEntityOnGround(entity: Entity): boolean {
  return entity.isOnGround;
}

export function startPlushInteractionSystem(): void {
  console.log("[Miku Plushie] Starting plush interaction system");

  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!player || !target) return;

    if (!PLUSH_ENTITIES.includes(target.typeId as any)) {
      return;
    }

    if (!isEntityOnGround(target)) return;

    const tameable = target.getComponent("minecraft:tameable");
    if (!tameable?.isTamed) return;
    if (tameable.tamedToPlayerId !== player.id) return;

    const equippable = player.getComponent("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);
    const playerItem = mainhand?.getItem();

    if (player.isSneaking && (!playerItem || playerItem.typeId === "minecraft:air")) {
      const targetEquippable = target.getComponent("minecraft:equippable");
      const targetMainhand = targetEquippable?.getEquipmentSlot(EquipmentSlot.Mainhand);

      if (targetMainhand?.hasItem()) {
        const item = targetMainhand.getItem();
        if (item) {
          target.dimension.spawnItem(item, target.location);
          targetMainhand.setItem(undefined);
        }
      }
      return;
    }

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

    const healthComponent = target.getComponent("minecraft:health");
    if (healthComponent && healthComponent.currentValue < healthComponent.effectiveMax) {
      if (playerItem?.typeId === "miku:leek") {
        healthComponent.setCurrentValue(Math.min(healthComponent.currentValue + 4, healthComponent.effectiveMax));

        const character = getCharacterFromEntity(target.typeId);
        target.dimension.playSound("entity.generic.eat", target.location, {
          volume: 1,
          pitch: 1,
        });
        playPlushSound(target, character, "eat", 1, 1);

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
    }

    // Default: toggle sit (any item or empty hand, matches Java behavior)
    target.triggerEvent("miku:toggle_sit");
  });
}
