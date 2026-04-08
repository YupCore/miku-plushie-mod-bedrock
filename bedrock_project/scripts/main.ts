import { world, system, Dimension } from "@minecraft/server";

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

const SOUND_CHARACTERS: Record<string, { oie: string; dor: string; bye: string; equip: string }> = {
  miku: {
    oie: "miku.plushie.miku_oie",
    dor: "miku.plushie.miku_dor",
    bye: "miku.plushie.miku_bye",
    equip: "miku.plushie.miku_equip",
  },
  teto: {
    oie: "miku.plushie.teto_oie",
    dor: "miku.plushie.teto_dor",
    bye: "miku.plushie.teto_bye",
    equip: "miku.plushie.teto_equip",
  },
  neru: {
    oie: "miku.plushie.neru_oie",
    dor: "miku.plushie.neru_dor",
    bye: "miku.plushie.neru_bye",
    equip: "miku.plushie.neru_equip",
  },
  rin: {
    oie: "miku.plushie.rin_oie",
    dor: "miku.plushie.rin_dor",
    bye: "miku.plushie.rin_bye",
    equip: "miku.plushie.rin_equip",
  },
  len: {
    oie: "miku.plushie.len_oie",
    dor: "miku.plushie.len_dor",
    bye: "miku.plushie.len_bye",
    equip: "miku.plushie.len_equip",
  },
  gumi: {
    oie: "miku.plushie.gumi_oie",
    dor: "miku.plushie.gumi_dor",
    bye: "miku.plushie.gumi_bye",
    equip: "miku.plushie.gumi_equip",
  },
  aiko: {
    oie: "miku.plushie.aiko_oie",
    dor: "miku.plushie.aiko_dor",
    bye: "miku.plushie.aiko_bye",
    equip: "miku.plushie.aiko_equip",
  },
  luka: {
    oie: "miku.plushie.luka_oie",
    dor: "miku.plushie.luka_dor",
    bye: "miku.plushie.luka_bye",
    equip: "miku.plushie.luka_equip",
  },
  meiko: {
    oie: "miku.plushie.meiko_oie",
    dor: "miku.plushie.meiko_dor",
    bye: "miku.plushie.meiko_bye",
    equip: "miku.plushie.meiko_equip",
  },
  kaito: {
    oie: "miku.plushie.kaito_oie",
    dor: "miku.plushie.kaito_dor",
    bye: "miku.plushie.kaito_bye",
    equip: "miku.plushie.kaito_equip",
  },
};

const ENTITY_TO_CHARACTER: Record<string, string> = {
  "miku:miku_plush": "miku",
  "miku:aiko_plush": "aiko",
  "miku:teto_plush": "teto",
  "miku:akita_neru_plush": "neru",
  "miku:rin_plush": "rin",
  "miku:len_plush": "len",
  "miku:konoha_plush": "miku",
  "miku:luka_plush": "luka",
  "miku:meiko_plush": "meiko",
  "miku:gumi_plush": "gumi",
  "miku:kaito_plush": "kaito",
};

function processJukeboxDetection(dimension: Dimension) {
  for (const plushType of PLUSH_ENTITIES) {
    for (const entity of dimension.getEntities({ type: plushType })) {
      const pos = entity.location;
      const blockPos = { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };
      let nearJukebox = false;

      for (let dx = -8; dx <= 8; dx++) {
        for (let dz = -8; dz <= 8; dz++) {
          const block = dimension.getBlock({
            x: blockPos.x + dx,
            y: blockPos.y,
            z: blockPos.z + dz,
          });
          if (block?.typeId === "minecraft:jukebox") {
            nearJukebox = true;
            break;
          }
        }
        if (nearJukebox) break;
      }

      const wasDancing = entity.getProperty("miku:is_dancing") ?? false;
      entity.setProperty("miku:is_dancing", nearJukebox);

      if (nearJukebox && !wasDancing) {
        const char = ENTITY_TO_CHARACTER[entity.typeId];
        if (char) {
          dimension.playSound(SOUND_CHARACTERS[char].oie, pos);
        }
      }
    }
  }
}

console.log("[Miku Plushie] Script loaded successfully!");

system.runInterval(() => {
  const overworld = world.getDimension("overworld");
  processJukeboxDetection(overworld);
  const nether = world.getDimension("nether");
  processJukeboxDetection(nether);
  const end = world.getDimension("the_end");
  processJukeboxDetection(end);
}, 20);

world.afterEvents.worldLoad.subscribe(() => {
  console.log("[Miku Plushie] World loaded!");
});
