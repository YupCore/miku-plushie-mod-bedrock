import { EquipmentSlot, Player, world } from "@minecraft/server";
import { getCharacterFromBlock, playPlushSoundAtPosition } from "../utils/sounds";
import { isPlushBlockItem } from "../utils/plush_registry";

export function startAttackSoundSystem(): void {
  world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity } = event;

    if (damagingEntity.typeId !== "minecraft:player") return;

    const player = damagingEntity as Player;
    const equippable = player.getComponent("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);

    if (!mainhand?.hasItem()) return;

    const itemId = mainhand.typeId;

    if (isPlushBlockItem(itemId)) {
      const character = getCharacterFromBlock(itemId);
      playPlushSoundAtPosition(player.dimension, player.location, character, "dor");
    }
  });
}
