import { world, system, Dimension, BlockRecordPlayerComponent } from "@minecraft/server";
import { getDanceCountForEntity } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

const JUKEBOX_CHECK_RADIUS = 8;
const DANCE_CHECK_INTERVAL = 20;

function isJukeboxNearby(dimension: Dimension, x: number, y: number, z: number): boolean {
  for (let dx = -JUKEBOX_CHECK_RADIUS; dx <= JUKEBOX_CHECK_RADIUS; dx++) {
    for (let dz = -JUKEBOX_CHECK_RADIUS; dz <= JUKEBOX_CHECK_RADIUS; dz++) {
      for (let dy = -2; dy <= 2; dy++) {
        const block = dimension.getBlock({ x: x + dx, y: y + dy, z: z + dz });
        if (block?.typeId === "minecraft:jukebox") {
          try {
            const recordPlayer = block.getComponent("minecraft:record_player") as BlockRecordPlayerComponent | undefined;
            if (recordPlayer?.isPlaying()) return true;
          } catch {
            // component unavailable
          }
        }
      }
    }
  }
  return false;
}

function processJukeboxDetection(dimension: Dimension): void {
  const entities = dimension.getEntities({ families: ["plush"] });
  if (entities.length === 0) return;

  for (const entity of entities) {
    const pos = entity.location;
    const nearJukebox = isJukeboxNearby(dimension, Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));

    const wasDancing = entity.getProperty("miku:is_dancing") ?? false;
    entity.setProperty("miku:is_dancing", nearJukebox);

    if (nearJukebox && !wasDancing) {
      const character = getCharacterFromEntity(entity.typeId);
      playPlushSound(entity, character, "oie", 1.0, 1.0);

      const maxDances = getDanceCountForEntity(entity.typeId);
      entity.setProperty("miku:dance_index", Math.floor(Math.random() * maxDances));
    }
  }
}

export function startJukeboxDanceSystem(): void {
  console.log("[Miku Plushie] Starting jukebox dance detection system");

  system.runInterval(() => {
    for (const dimId of ["overworld", "nether", "the_end"]) {
      try {
        processJukeboxDetection(world.getDimension(dimId));
      } catch {
        // Dimension not loaded
      }
    }
  }, DANCE_CHECK_INTERVAL);
}
