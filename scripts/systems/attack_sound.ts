import { world, EquipmentSlot } from "@minecraft/server";
import { getCharacterFromBlock, playPlushSoundAtPosition } from "../utils/sounds";

const PLUSH_BLOCK_PREFIXES = [
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

// Exact-match set for items that ARE the base block (no suffix)
const PLUSH_BLOCK_EXACT = new Set(PLUSH_BLOCK_PREFIXES);

function isPlushItem(itemId: string): boolean {
  if (PLUSH_BLOCK_EXACT.has(itemId)) return true;
  for (const prefix of PLUSH_BLOCK_PREFIXES) {
    if (itemId.startsWith(prefix + "_")) return true;
  }
  return false;
}

export function startAttackSoundSystem(): void {
  console.log("[Miku Plushie] Starting attack sound system");

  world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity } = event;

    if (damagingEntity.typeId !== "minecraft:player") return;

    const player = damagingEntity as any;
    const equippable = player.getComponent?.("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);

    if (!mainhand?.hasItem()) return;

    const itemId = mainhand.typeId;

    if (isPlushItem(itemId)) {
      const character = getCharacterFromBlock(itemId);
      playPlushSoundAtPosition(player.dimension, player.location, character, "dor");
    }
  });
}
