import { world, EquipmentSlot } from "@minecraft/server";
import { getCharacterFromBlock } from "../utils/sounds";

const PLUSH_BLOCK_ITEMS = [
  "miku:miku_plush",
  "miku:aiko_plush",
  "miku:teto_plush",
  "miku:akita_neru_plush",
  "miku:rin_plush",
  "miku:len_plush",
  "miku:konoha_plush",
  "miku:luka_plush",
  "miku:meiko_plush",
  "miku:gumi_plush",
  "miku:kaito_plush",
];

function isPlushItem(itemId: string): boolean {
  return PLUSH_BLOCK_ITEMS.some((plush) => itemId === plush || itemId.startsWith(plush + "_"));
}

export function startAttackSoundSystem(): void {
  console.log("[Miku Plushie] Starting attack sound system");

  world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity, hitEntity } = event;

    if (damagingEntity.typeId !== "minecraft:player") return;

    const player = damagingEntity as any;
    const equippable = player.getComponent?.("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);

    if (!mainhand?.hasItem()) return;

    const itemId = mainhand.typeId;

    if (isPlushItem(itemId)) {
      const character = getCharacterFromBlock(itemId);
      player.dimension?.playSound("miku.plushie." + character + "_dor", player.location, {
        volume: 0.5,
        pitch: 1,
      });
    }
  });
}
