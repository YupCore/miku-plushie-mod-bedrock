export const PLUSH_ENTITIES = [
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
] as const;

export const MIKU_VARIANTS = [
  "miku_plush",
  "miku_plush_br",
  "miku_plush_br_am",
  "miku_plush_br_ba",
  "miku_plush_br_ba_drum",
  "miku_plush_br_beach",
  "miku_plush_br_bik_orange",
  "miku_plush_br_braid",
  "miku_plush_br_brown_bro",
  "miku_plush_br_electrician",
  "miku_plush_br_fut_cam",
  "miku_plush_br_fut_crvg",
  "miku_plush_br_fut_fla",
  "miku_plush_br_go",
  "miku_plush_br_mg",
  "miku_plush_br_pa",
  "miku_plush_br_rs",
  "miku_plush_br_school_pe",
  "miku_plush_br_sp",
  "miku_plush_bik",
  "miku_plush_deep_sea_girl",
  "miku_plush_devil",
  "miku_plush_digital_stars_2025",
  "miku_plush_dont_believe_in_t",
  "miku_plush_fortnite_neko",
  "miku_plush_frankenstein",
  "miku_plush_frog",
  "miku_plush_ghost",
  "miku_plush_ghostface",
  "miku_plush_hachune",
  "miku_plush_helloplanet",
  "miku_plush_hollow_knight",
  "miku_plush_hornet",
  "miku_plush_infinity",
  "miku_plush_jason",
  "miku_plush_link",
  "miku_plush_lucario_z",
  "miku_plush_mesmerizer",
  "miku_plush_michael_myers",
  "miku_plush_mochimochi",
  "miku_plush_monitoring",
  "miku_plush_mummy",
  "miku_plush_mushroom",
  "miku_plush_patata",
  "miku_plush_patati",
  "miku_plush_personadancing",
  "miku_plush_pppp",
  "miku_plush_psycho_mode",
  "miku_plush_pumpkin",
  "miku_plush_reindeer",
  "miku_plush_renaissance",
  "miku_plush_rolling_girl",
  "miku_plush_rotten_girl",
  "miku_plush_santa",
  "miku_plush_santa_elf",
  "miku_plush_senbonzakura",
  "miku_plush_sonic",
  "miku_plush_sonic_crossworlds",
  "miku_plush_static",
  "miku_plush_synthv",
  "miku_plush_uraotomelovers",
  "miku_plush_v4",
  "miku_plush_vampire",
  "miku_plush_werewoman",
  "miku_plush_witch",
  "miku_plush_world_is_mine",
  "miku_plush_xmas_tree",
  "miku_plush_zatsune",
] as const;

export const TETO_VARIANTS = [
  "teto_plush",
  "teto_plush_birdbrain",
  "teto_plush_dont_believe_in_t",
  "teto_plush_liar_dancer",
  "teto_plush_lobster",
  "teto_plush_mesmerizer",
  "teto_plush_pppp",
  "teto_plush_regret_rock",
  "teto_plush_shadow",
  "teto_plush_shrimp",
  "teto_plush_some_more_of_that_song",
  "teto_plush_spoken_for",
  "teto_plush_synthv",
  "teto_plush_whatchacallitsname",
] as const;

export const NERU_VARIANTS = ["akita_neru_plush", "akita_neru_plush_tails"] as const;

export const MEIKO_VARIANTS = ["meiko_plush", "meiko_plush_v3", "meiko_plush_v4"] as const;

export const GUMI_VARIANTS = ["gumi_plush", "gumi_plush_v3", "gumi_plush_v4", "gumi_plush_v6"] as const;

export const KAITO_VARIANTS = ["kaito_plush", "kaito_plush_v3", "kaito_plush_v4"] as const;

export const SINGLE_VARIANT_ENTITIES = ["aiko_plush", "rin_plush", "len_plush", "konoha_plush", "luka_plush"] as const;

const MODEL2_SET = new Set([
  "miku_plush_devil",
  "miku_plush_mushroom",
  "miku_plush_patata",
  "miku_plush_patati",
  "miku_plush_werewoman",
  "miku_plush_witch",
]);

const MODEL3_SET = new Set([
  "miku_plush_digital_stars_2025",
  "miku_plush_dont_believe_in_t",
  "miku_plush_hollow_knight",
  "miku_plush_hornet",
  "miku_plush_lucario_z",
  "miku_plush_mochimochi",
  "miku_plush_monitoring",
  "miku_plush_pppp",
  "miku_plush_psycho_mode",
  "miku_plush_rotten_girl",
  "miku_plush_sonic",
  "miku_plush_sonic_crossworlds",
  "miku_plush_static",
  "miku_plush_xmas_tree",
]);

// Pre-built reverse map: cleanId (no "miku:" prefix) → variant index within its group
const VARIANT_INDEX_MAP = new Map<string, number>();
(function buildVariantMap() {
  const groups = [MIKU_VARIANTS, TETO_VARIANTS, NERU_VARIANTS, MEIKO_VARIANTS, GUMI_VARIANTS, KAITO_VARIANTS];
  for (const group of groups) {
    group.forEach((id, i) => VARIANT_INDEX_MAP.set(id, i));
  }
  // single-variant entities all map to 0 (already default, included for completeness)
  for (const id of SINGLE_VARIANT_ENTITIES) {
    VARIANT_INDEX_MAP.set(id, 0);
  }
})();

export function getGeoIndex(blockId: string): number {
  const cleanId = blockId.replace("miku:", "");
  if (MODEL2_SET.has(cleanId)) return 1;
  if (MODEL3_SET.has(cleanId)) return 2;
  return 0;
}

export function getVariantIndex(blockId: string): number {
  return VARIANT_INDEX_MAP.get(blockId.replace("miku:", "")) ?? 0;
}

export function getEntityTypeFromBlock(blockId: string): string {
  const cleanId = blockId.replace("miku:", "");

  if (cleanId.startsWith("miku_plush")) return "miku:miku_plush";
  if (cleanId.startsWith("teto_plush")) return "miku:teto_plush";
  if (cleanId.startsWith("akita_neru_plush")) return "miku:akita_neru_plush";
  if (cleanId.startsWith("aiko_plush")) return "miku:aiko_plush";
  if (cleanId.startsWith("rin_plush")) return "miku:rin_plush";
  if (cleanId.startsWith("len_plush")) return "miku:len_plush";
  if (cleanId.startsWith("konoha_plush")) return "miku:konoha_plush";
  if (cleanId.startsWith("luka_plush")) return "miku:luka_plush";
  if (cleanId.startsWith("meiko_plush")) return "miku:meiko_plush";
  if (cleanId.startsWith("gumi_plush")) return "miku:gumi_plush";
  if (cleanId.startsWith("kaito_plush")) return "miku:kaito_plush";

  return "miku:miku_plush";
}

export function getDanceCountForEntity(entityTypeId: string): number {
  switch (entityTypeId) {
    case "miku:miku_plush":
      return 5;
    case "miku:teto_plush":
      return 4;
    case "miku:akita_neru_plush":
      return 3;
    default:
      return 1;
  }
}

export function isMikuEntity(entityTypeId: string): boolean {
  return entityTypeId === "miku:miku_plush";
}

export function isTetoPickaxeItem(itemId: string): boolean {
  return itemId.startsWith("miku:teto_pickaxe");
}
