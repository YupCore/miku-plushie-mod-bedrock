import { world, EquipmentSlot } from "@minecraft/server";

const TETO_PICKAXE_SET = new Set([
  "miku:teto_pickaxe",
  "miku:teto_pickaxe_birdbrain",
  "miku:teto_pickaxe_dont_believe_in_t",
  "miku:teto_pickaxe_liar_dancer",
  "miku:teto_pickaxe_lobster",
  "miku:teto_pickaxe_mesmerizer",
  "miku:teto_pickaxe_pppp",
  "miku:teto_pickaxe_regret_rock",
  "miku:teto_pickaxe_shadow",
  "miku:teto_pickaxe_some_more_of_that_song",
  "miku:teto_pickaxe_spoken_for",
  "miku:teto_pickaxe_synthv",
  "miku:teto_pickaxe_whatchacallitsname",
]);

export function startPickaxeBreakSoundSystem(): void {
  console.log("[Miku Plushie] Starting pickaxe break sound system");

  world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { player, block } = event;
    if (!player) return;

    const equippable = player.getComponent("minecraft:equippable");
    const itemInHand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!itemInHand?.hasItem()) return;

    if (!TETO_PICKAXE_SET.has(itemInHand.typeId)) return;

    const item = itemInHand.getItem();
    if (item) {
      const durability = item.getComponent("minecraft:durability");
      if (durability && durability.damage >= durability.maxDurability - 1) {
        player.dimension.playSound("miku.plushie.teto_bye", block.location, {
          volume: 0.8,
          pitch: 1,
        });
      }
    }
  });
}
