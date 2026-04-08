import { world, system, Player, Entity, Vector3, EquipmentSlot, GameMode } from "@minecraft/server";

export interface SoundCharacter {
  oie: string;
  dor: string;
  bye: string;
  equip: string;
  eat?: string;
  canudinho?: string;
}

export const SOUND_CHARACTERS: Record<string, SoundCharacter> = {
  miku: {
    oie: "miku.plushie.miku_oie",
    dor: "miku.plushie.miku_dor",
    bye: "miku.plushie.miku_bye",
    equip: "miku.plushie.miku_equip",
    eat: "miku.plushie.miku_eat",
    canudinho: "miku.plushie.miku_canudinho",
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

export function getCharacterFromEntity(entityTypeId: string): string {
  const mapping: Record<string, string> = {
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
  return mapping[entityTypeId] ?? "miku";
}

export function getCharacterFromBlock(blockId: string): string {
  const parts = blockId.replace("miku:", "").split("_");
  const firstPart = parts[0];
  return firstPart;
}

export function getSoundForCharacter(character: string, soundType: keyof SoundCharacter): string {
  const charSounds = SOUND_CHARACTERS[character];
  if (!charSounds) return SOUND_CHARACTERS["miku"][soundType] ?? "";
  return charSounds[soundType] ?? "";
}

export function playPlushSound(
  entity: Entity,
  character: string,
  soundType: keyof SoundCharacter,
  volume: number = 1.0,
  pitch: number = 1.0
): void {
  const sound = getSoundForCharacter(character, soundType);
  if (sound) {
    entity.dimension.playSound(sound, entity.location, {
      volume,
      pitch,
    });
  }
}

export function playPlushSoundAtPosition(
  dimension: any,
  position: Vector3,
  character: string,
  soundType: keyof SoundCharacter,
  volume: number = 1.0,
  pitch: number = 1.0
): void {
  const sound = getSoundForCharacter(character, soundType);
  if (sound) {
    dimension.playSound(sound, position, {
      volume,
      pitch,
    });
  }
}
