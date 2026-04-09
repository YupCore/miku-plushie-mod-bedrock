import { world } from "@minecraft/server";

import { registerPlushBlockComponent } from "./components/plush_block";
import { startCropGrowthSystem } from "./components/crop_growth";
import { startJukeboxDanceSystem } from "./systems/jukebox_dance";
import { startPlushInteractionSystem } from "./systems/plush_interaction";
import { startAttackSoundSystem } from "./systems/attack_sound";
import { startPickaxeBreakSoundSystem } from "./systems/pickaxe_break_sound";
import { startMikuEatLeekSystem } from "./systems/miku_eat_leek";
import { startSpawnAgeTracker } from "./systems/spawn_age_tracker";
import { startVariantSyncSystem } from "./systems/variant_sync";
import { startSpawnMikusCommand } from "./commands/spawn_mikus";

console.log("[Miku Plushie] Miku is now Joining Bedrock Edition!!!");

try {
  registerPlushBlockComponent();
  console.log("[Miku Plushie] Registered plush block component");
} catch (e) {
  console.warn("[Miku Plushie] Plush block component registration skipped:", e);
}

try {
  startCropGrowthSystem();
  console.log("[Miku Plushie] Started crop growth system");
} catch (e) {
  console.error("[Miku Plushie] Failed to start crop growth system:", e);
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
  startPickaxeBreakSoundSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start pickaxe break sound system:", e);
}

try {
  startMikuEatLeekSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start Miku eat leek system:", e);
}

try {
  startSpawnAgeTracker();
} catch (e) {
  console.error("[Miku Plushie] Failed to start spawn age tracker:", e);
}

try {
  startVariantSyncSystem();
} catch (e) {
  console.error("[Miku Plushie] Failed to start variant sync system:", e);
}

try {
  startSpawnMikusCommand();
} catch (e) {
  console.error("[Miku Plushie] Failed to start spawn mikus command:", e);
}

world.afterEvents.worldLoad.subscribe(() => {
  console.log("[Miku Plushie] World loaded!");
});

console.log("[Miku Plushie] All systems initialized successfully!");
console.log("[Miku Plushie] Miku: (^v^)/ Hi!!!");
