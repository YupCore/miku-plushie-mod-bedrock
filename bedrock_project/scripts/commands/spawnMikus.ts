import { world, system, Player } from "@minecraft/server";

const PLUSH_BLOCKS = [
  "miku:miku_plush",
  "miku:miku_plush_br",
  "miku:miku_plush_br_am",
  "miku:miku_plush_br_ba",
  "miku:miku_plush_br_ba_drum",
  "miku:miku_plush_br_beach",
  "miku:miku_plush_br_bik_orange",
  "miku:miku_plush_br_braid",
  "miku:miku_plush_br_brown_bro",
  "miku:miku_plush_br_electrician",
  "miku:miku_plush_br_fut_cam",
  "miku:miku_plush_br_fut_crvg",
  "miku:miku_plush_br_fut_fla",
  "miku:miku_plush_br_go",
  "miku:miku_plush_br_mg",
  "miku:miku_plush_br_pa",
  "miku:miku_plush_br_rs",
  "miku:miku_plush_br_school_pe",
  "miku:miku_plush_br_sp",
  "miku:miku_plush_bik",
  "miku:miku_plush_deep_sea_girl",
  "miku:miku_plush_devil",
  "miku:miku_plush_digital_stars_2025",
  "miku:miku_plush_dont_believe_in_t",
  "miku:miku_plush_fortnite_neko",
  "miku:miku_plush_frankenstein",
  "miku:miku_plush_frog",
  "miku:miku_plush_ghost",
  "miku:miku_plush_ghostface",
  "miku:miku_plush_hachune",
  "miku:miku_plush_helloplanet",
  "miku:miku_plush_hollow_knight",
  "miku:miku_plush_hornet",
  "miku:miku_plush_infinity",
  "miku:miku_plush_jason",
  "miku:miku_plush_link",
  "miku:miku_plush_lucario_z",
  "miku:miku_plush_mesmerizer",
  "miku:miku_plush_michael_myers",
  "miku:miku_plush_mochimochi",
  "miku:miku_plush_monitoring",
  "miku:miku_plush_mummy",
  "miku:miku_plush_mushroom",
  "miku:miku_plush_patata",
  "miku:miku_plush_patati",
  "miku:miku_plush_personadancing",
  "miku:miku_plush_pppp",
  "miku:miku_plush_psycho_mode",
  "miku:miku_plush_pumpkin",
  "miku:miku_plush_reindeer",
  "miku:miku_plush_renaissance",
  "miku:miku_plush_rolling_girl",
  "miku:miku_plush_rotten_girl",
  "miku:miku_plush_santa",
  "miku:miku_plush_santa_elf",
  "miku:miku_plush_senbonzakura",
  "miku:miku_plush_sonic",
  "miku:miku_plush_sonic_crossworlds",
  "miku:miku_plush_static",
  "miku:miku_plush_synthv",
  "miku:miku_plush_uraotomelovers",
  "miku:miku_plush_v4",
  "miku:miku_plush_vampire",
  "miku:miku_plush_werewoman",
  "miku:miku_plush_witch",
  "miku:miku_plush_world_is_mine",
  "miku:miku_plush_xmas_tree",
  "miku:miku_plush_zatsune",
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

const ITEMS = [
  "miku:leek",
  "miku:leek_seeds",
  "miku:baguette",
  "miku:canudinho",
  "miku:vocaloid_heart",
  "miku:akita_neru_phone",
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

const PLUSH_ENTITIES = [
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

export function startSpawnMikusCommand(): void {
  console.log("[Miku Plushie] Starting /spawn_mikus command");

  system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "miku:spawn_mikus") return;

    const player = event.sourceEntity as Player;
    if (!player || player.typeId !== "minecraft:player") return;

    const dimension = player.dimension;
    const baseLoc = player.location;
    const startX = Math.floor(baseLoc.x);
    const startY = Math.floor(baseLoc.y);
    const startZ = Math.floor(baseLoc.z);

    let currentX = startX;
    let currentY = startY;
    let currentZ = startZ;
    let count = 0;
    const maxPerRow = 10;

    player.sendMessage("Spawning all Miku items...");

    for (const blockId of PLUSH_BLOCKS) {
      try {
        dimension.getBlock({ x: currentX, y: currentY, z: currentZ })?.setType("minecraft:air");
        dimension.spawnParticle("miku:miku_spawn", { x: currentX + 0.5, y: currentY + 0.5, z: currentZ + 0.5 });
        count++;

        currentX++;
        if (count % maxPerRow === 0) {
          currentX = startX;
          currentZ++;
        }
      } catch {
        player.sendMessage(`Error spawning ${blockId}`);
      }
    }

    currentZ += 2;

    for (const itemId of ITEMS) {
      try {
        const itemStack = { typeId: itemId };
        dimension.spawnItem(itemStack as any, { x: currentX + 0.5, y: currentY + 1, z: currentZ + 0.5 });
        count++;

        currentX++;
        if (count % maxPerRow === 0) {
          currentX = startX;
          currentZ++;
        }
      } catch {
        player.sendMessage(`Error spawning ${itemId}`);
      }
    }

    currentZ += 2;

    for (const entityId of PLUSH_ENTITIES) {
      try {
        dimension.spawnEntity(entityId, { x: currentX + 0.5, y: currentY + 1, z: currentZ + 0.5 });
        count++;

        currentX++;
        if (count % maxPerRow === 0) {
          currentX = startX;
          currentZ++;
        }
      } catch {
        player.sendMessage(`Error spawning ${entityId}`);
      }
    }

    player.sendMessage(`Spawned ${count} items/entities!`);
  });
}
