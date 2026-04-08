import { world, EquipmentSlot } from "@minecraft/server";

const TETO_PICKAXE_ITEMS = [
  "miku:teto_pickaxe",
  "miku:teto_pickaxe_birdbrain",
  "miku:teto_pickaxe_dont_believe_in_t",
  "miku:teto_pickaxe_liar_dancer",
  "miku:teto_pickaxe_lobster",
  "miku:teto_pickaxe_mesmerizer",
  "miku:teto_pickaxe_pppp",
  "miku:teto_pickaxe_regret_rock",
  "miku:teto_pickaxe_shadow",
  "miku:teto_pickaxe_shrimp",
  "miku:teto_pickaxe_some_more_of_that_song",
  "miku:teto_pickaxe_spoken_for",
  "miku:teto_pickaxe_synthv",
  "miku:teto_pickaxe_whatchacallitsname",
];

function isTetoPickaxeItem(itemId: string): boolean {
  return TETO_PICKAXE_ITEMS.includes(itemId);
}

export function startPickaxeBreakSoundSystem(): void {
  console.log("[Miku Plushie] Starting pickaxe break sound system");

  world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { player, block } = event;
    if (!player) return;

    const equippable = player.getComponent("minecraft:equippable");
    const itemInHand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!itemInHand?.hasItem()) return;

    const itemId = itemInHand.typeId;

    if (isTetoPickaxeItem(itemId)) {
      const item = itemInHand.getItem();
      if (item) {
        const durability = item.getComponent("minecraft:durability");
        if (durability) {
          const currentDur = durability.damage;
          const maxDur = durability.maxDurability;

          if (currentDur >= maxDur - 1) {
            player.dimension.playSound("miku.plushie.teto_bye", block.location, {
              volume: 0.8,
              pitch: 1,
            });
          }
        }
      }
    }
  });
}
