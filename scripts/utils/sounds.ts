import { Dimension, Entity, Vector3 } from "@minecraft/server";

export interface SoundCharacter {
  oie: string;
  dor: string;
  bye: string;
  eat?: string;
  canudinho?: string;
  phone?: string;
}

export const SOUND_CHARACTERS: Record<string, SoundCharacter> = {
  miku: {
    oie: "miku.plushie.miku_oie",
    dor: "miku.plushie.miku_dor",
    bye: "miku.plushie.miku_bye",
    eat: "miku.plushie.miku_eat",
    canudinho: "miku.plushie.miku_canudinho",
  },
  teto: {
    oie: "miku.plushie.teto_oie",
    dor: "miku.plushie.teto_dor",
    bye: "miku.plushie.teto_bye",
    eat: "miku.plushie.teto_eat",
  },
  neru: {
    oie: "miku.plushie.neru_oie",
    dor: "miku.plushie.neru_dor",
    bye: "miku.plushie.neru_bye",
    phone: "miku.plushie.neru_phone",
  },
  rin: {
    oie: "miku.plushie.rin_oie",
    dor: "miku.plushie.rin_dor",
    bye: "miku.plushie.rin_bye",
  },
  len: {
    oie: "miku.plushie.len_oie",
    dor: "miku.plushie.len_dor",
    bye: "miku.plushie.len_bye",
  },
  gumi: {
    oie: "miku.plushie.gumi_oie",
    dor: "miku.plushie.gumi_dor",
    bye: "miku.plushie.gumi_bye",
  },
  aiko: {
    oie: "miku.plushie.aiko_oie",
    dor: "miku.plushie.aiko_dor",
    bye: "miku.plushie.aiko_bye",
  },
  luka: {
    oie: "miku.plushie.luka_oie",
    dor: "miku.plushie.luka_dor",
    bye: "miku.plushie.luka_bye",
  },
  meiko: {
    oie: "miku.plushie.meiko_oie",
    dor: "miku.plushie.meiko_dor",
    bye: "miku.plushie.meiko_bye",
  },
  kaito: {
    oie: "miku.plushie.kaito_oie",
    dor: "miku.plushie.kaito_dor",
    bye: "miku.plushie.kaito_bye",
  },
};

export function getCharacterFromEntity(entityTypeId: string): string | null {
  const mapping: Record<string, string> = {
    "miku:miku_plush": "miku",
    "miku:aiko_plush": "aiko",
    "miku:teto_plush": "teto",
    "miku:akita_neru_plush": "neru",
    "miku:rin_plush": "rin",
    "miku:len_plush": "len",
    "miku:konoha_plush": "",
    "miku:luka_plush": "luka",
    "miku:meiko_plush": "meiko",
    "miku:gumi_plush": "gumi",
    "miku:kaito_plush": "kaito",
  };

  const family = mapping[entityTypeId];
  return family === undefined || family === "" ? null : family;
}

export function getCharacterFromBlock(blockId: string): string | null {
  const firstPart = blockId.replace("miku:", "").split("_")[0];
  if (firstPart === "konoha") return null;
  if (firstPart === "akita") return "neru";
  return firstPart;
}

export function getSoundForCharacter(character: string | null, soundType: keyof SoundCharacter): string | null {
  if (!character) return null;

  const charSounds = SOUND_CHARACTERS[character];
  if (!charSounds) return null;
  return charSounds[soundType] ?? null;
}

export function playPlushSound(
  entity: Entity,
  character: string | null,
  soundType: keyof SoundCharacter,
  volume: number = 0.5,
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
  dimension: Dimension,
  position: Vector3,
  character: string | null,
  soundType: keyof SoundCharacter,
  volume: number = 0.5,
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
