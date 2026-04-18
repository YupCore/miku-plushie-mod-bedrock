import { system, world } from "@minecraft/server";

import { registerPlushBlockComponent } from "./components/plush_block";
import { registerCropGrowthComponent } from "./components/crop_growth";
import { registerPickaxeDurabilityComponent } from "./components/pickaxe_durability";
import { startJukeboxDanceSystem } from "./systems/jukebox_dance";
import { startPlushInteractionSystem } from "./systems/plush_interaction";
import { startAttackSoundSystem } from "./systems/attack_sound";
import { startDeathSoundSystem } from "./systems/death_sound";
import { startMikuEatLeekSystem } from "./systems/miku_eat_leek";
import { startNeruPhoneSoundSystem } from "./systems/neru_phone_sound";

console.log("[Miku Plushie] Miku is now Joining Bedrock Edition!!!");
type StartupRegistration = {
  label: string;
  register: (
    event: Parameters<typeof system.beforeEvents.startup.subscribe>[0] extends (arg: infer T) => void ? T : never
  ) => void;
};

type RuntimeSystem = {
  label: string;
  start: () => void;
};

const startupRegistrations: StartupRegistration[] = [
  {
    label: "plush block component",
    register: ({ blockComponentRegistry }) => registerPlushBlockComponent(blockComponentRegistry),
  },
  {
    label: "crop growth component",
    register: ({ blockComponentRegistry }) => registerCropGrowthComponent(blockComponentRegistry),
  },
  {
    label: "pickaxe durability component",
    register: ({ itemComponentRegistry }) => registerPickaxeDurabilityComponent(itemComponentRegistry),
  },
];

const runtimeSystems: RuntimeSystem[] = [
  { label: "jukebox dance system", start: startJukeboxDanceSystem },
  { label: "plush interaction system", start: startPlushInteractionSystem },
  { label: "attack sound system", start: startAttackSoundSystem },
  { label: "death sound system", start: startDeathSoundSystem },
  { label: "Miku eat leek system", start: startMikuEatLeekSystem },
  { label: "Neru phone sound system", start: startNeruPhoneSoundSystem },
];

system.beforeEvents.startup.subscribe((event) => {
  let registeredCount = 0;

  for (const registration of startupRegistrations) {
    try {
      registration.register(event);
      registeredCount++;
    } catch (error) {
      console.error(`[Miku Plushie] Failed to register ${registration.label}:`, error);
    }
  }

  console.log(`[Miku Plushie] Startup registration complete (${registeredCount}/${startupRegistrations.length})`);
});

let startedCount = 0;
for (const runtimeSystem of runtimeSystems) {
  try {
    runtimeSystem.start();
    startedCount++;
  } catch (error) {
    console.error(`[Miku Plushie] Failed to start ${runtimeSystem.label}:`, error);
  }
}

world.afterEvents.worldLoad.subscribe(() => {
  console.log("[Miku Plushie] Miku: (^v^)/ Hi!!!");
});

console.log(`[Miku Plushie] Runtime systems ready (${startedCount}/${runtimeSystems.length})`);
