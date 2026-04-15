import { world, EquipmentSlot, GameMode, Entity } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

const PLUSH_ENTITY_TYPE_SET = new Set<string>(PLUSH_ENTITIES);
function isTrackedPlushEntity(entity: Entity): boolean {
  return PLUSH_ENTITY_TYPE_SET.has(entity.typeId);
}

function enablePickupAfterLoad(entity: Entity): void {
  if (!isTrackedPlushEntity(entity)) return;

  try {
    entity.triggerEvent("miku:pickup_unlock");
  } catch (e) {
    console.warn("[Miku Plushie] Failed to enable plush pickup behavior:", e);
  }
}

export function startPlushInteractionSystem(): void {
  console.log("[Miku Plushie] Starting plush interaction system (fixed simplified version)");

  world.afterEvents.entityLoad.subscribe((event) => {
    enablePickupAfterLoad(event.entity);
  });

  // Player interaction
  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!player || !target) return;
    if (!isTrackedPlushEntity(target)) return;
    if (!target.isOnGround) return;

    const tameable = target.getComponent("minecraft:tameable");
    if (!tameable?.isTamed || tameable.tamedToPlayerId !== player.id) return;

    const equippable = player.getComponent("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);
    const playerItem = mainhand?.getItem();

    if (playerItem?.typeId === "miku:canudinho") {
      const character = getCharacterFromEntity(target.typeId);
      playPlushSound(target, character, "canudinho", 1, 1);

      const isCreative = player.getGameMode() === GameMode.Creative;
      if (!isCreative) {
        if (mainhand!.amount > 1) mainhand!.amount--;
        else mainhand!.setItem(undefined);
      }
      return;
    }

    if (playerItem?.typeId === "miku:leek") {
      const health = target.getComponent("minecraft:health");
      if (health && health.currentValue >= health.effectiveMax) return;
      const character = getCharacterFromEntity(target.typeId);
      target.dimension.playSound("entity.generic.eat", target.location, { volume: 1, pitch: 1 });
      playPlushSound(target, character, "eat", 1, 1);
      return;
    }
  });
}
