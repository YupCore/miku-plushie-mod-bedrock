import { world } from "@minecraft/server";

import { registerPlushBlockComponent } from "./components/plush_block";
import { registerCropGrowthComponent } from "./components/crop_growth";
import { registerPickaxeDurabilityComponent } from "./components/pickaxe_durability";
import { startJukeboxDanceSystem } from "./systems/jukebox_dance";
import { startPlushInteractionSystem } from "./systems/plush_interaction";
import { startAttackSoundSystem } from "./systems/attack_sound";
import { startDeathSoundSystem } from "./systems/death_sound";
import { startMikuEatLeekSystem } from "./systems/miku_eat_leek";
import { startNeruPhoneSoundSystem } from "./systems/neru_phone_sound";
import { startSpawnMikusCommand } from "./commands/spawn_mikus";

console.log("[Miku Plushie] Miku is now Joining Bedrock Edition!!!");

try {
  registerPlushBlockComponent();
  console.log("[Miku Plushie] Registered plush block component");
} catch (e) {
  console.warn("[Miku Plushie] Plush block component registration skipped:", e);
}

try {
  registerCropGrowthComponent();
  console.log("[Miku Plushie] Registered crop growth component");
} catch (e) {
  console.error("[Miku Plushie] Failed to register crop growth component:", e);
}

try {
  registerPickaxeDurabilityComponent();
  console.log("[Miku Plushie] Registered pickaxe durability component");
} catch (e) {
  console.error("[Miku Plushie] Failed to register pickaxe durability component:", e);
}

try {
  startJukeboxDanceSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start jukebox dance system:", e);
}

try {
  startPlushInteractionSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start plush interaction system:", e);
}

try {
  startAttackSoundSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start attack sound system:", e);
}

try {
  startDeathSoundSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start death sound system:", e);
}

try {
  startMikuEatLeekSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start Miku eat leek system:", e);
}

try {
  startNeruPhoneSoundSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start Neru phone sound system:", e);
}

try {
  startSpawnMikusCommand();
} catch (e) {
  console.error("[Miku Plushie] Failed to start spawn mikus command:", e);
}

world.afterEvents.worldLoad.subscribe(() => {
  console.log("[Miku Plushie] World loaded!");
  console.log("[Miku Plushie] Miku: (^v^)/ Hi!!!");
});

console.log("[Miku Plushie] All systems initialized successfully!");
