import { world, system, Dimension } from "@minecraft/server";
import { PLUSH_ENTITIES, getDanceCountForEntity } from "../utils/plushRegistry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

const JUKEBOX_CHECK_RADIUS = 8;
const DANCE_CHECK_INTERVAL = 20;

function processJukeboxDetection(dimension: Dimension): void {
  for (const plushType of PLUSH_ENTITIES) {
    const entities = dimension.getEntities({ type: plushType });
    for (const entity of entities) {
      const pos = entity.location;
      const blockX = Math.floor(pos.x);
      const blockY = Math.floor(pos.y);
      const blockZ = Math.floor(pos.z);

      let nearJukebox = false;

      for (let dx = -JUKEBOX_CHECK_RADIUS; dx <= JUKEBOX_CHECK_RADIUS; dx++) {
        for (let dz = -JUKEBOX_CHECK_RADIUS; dz <= JUKEBOX_CHECK_RADIUS; dz++) {
          const block = dimension.getBlock({
            x: blockX + dx,
            y: blockY,
            z: blockZ + dz,
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
        const character = getCharacterFromEntity(entity.typeId);
        playPlushSound(entity, character, "oie", 1.0, 1.0);

        const maxDances = getDanceCountForEntity(entity.typeId);
        const randomDanceIndex = Math.floor(Math.random() * maxDances);
        entity.setProperty("miku:dance_index", randomDanceIndex);
      }
    }
  }
}

export function startJukeboxDanceSystem(): void {
  console.log("[Miku Plushie] Starting jukebox dance detection system");

  system.runInterval(() => {
    for (const dimId of ["overworld", "nether", "the_end"]) {
      try {
        const dimension = world.getDimension(dimId);
        processJukeboxDetection(dimension);
      } catch (e) {
        // Dimension might not exist
      }
    }
  }, DANCE_CHECK_INTERVAL);
}
