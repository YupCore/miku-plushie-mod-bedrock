import { world, system, BlockRecordPlayerComponent } from "@minecraft/server";
import { getDanceCountForEntity } from "../utils/plush_registry";

const DANCE_CHECK_INTERVAL = 20;

// dimensionId → Set of "x,y,z" position strings for tracked jukeboxes
const jukeboxPositions = new Map<string, Set<string>>([
  ["overworld", new Set()],
  ["nether", new Set()],
  ["the_end", new Set()],
]);

// Dimension.id returns "minecraft:overworld" etc. — normalize to short form for map lookup
function normDimId(id: string): string {
  return id.replace("minecraft:", "");
}

function posKey(x: number, y: number, z: number): string {
  return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
}

function parseKey(key: string): { x: number; y: number; z: number } {
  const [x, y, z] = key.split(",").map(Number);
  return { x, y, z };
}

export function startJukeboxDanceSystem(): void {
  console.log("[Miku Plushie] Starting jukebox dance detection system");

  // Track jukebox placements
  world.afterEvents.playerPlaceBlock.subscribe((event) => {
    if (event.block.typeId !== "minecraft:jukebox") return;
    const set = jukeboxPositions.get(normDimId(event.dimension.id));
    if (set) set.add(posKey(event.block.x, event.block.y, event.block.z));
  });

  // Remove jukeboxes on break
  world.afterEvents.playerBreakBlock.subscribe((event) => {
    if (event.brokenBlockPermutation.type.id !== "minecraft:jukebox") return;
    const set = jukeboxPositions.get(normDimId(event.dimension.id));
    if (set) set.delete(posKey(event.block.x, event.block.y, event.block.z));
  });

  // Lazily register existing jukeboxes from player interaction (back-compat with pre-existing worlds)
  world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    if (event.block.typeId !== "minecraft:jukebox") return;
    const set = jukeboxPositions.get(normDimId(event.block.dimension.id));
    if (set) set.add(posKey(event.block.x, event.block.y, event.block.z));
  });

  system.runInterval(() => {
    for (const [dimId, positions] of jukeboxPositions) {
      if (positions.size === 0) continue;

      let dim: ReturnType<typeof world.getDimension>;
      try {
        dim = world.getDimension(dimId);
      } catch {
        continue;
      }

      // Collect entities set dancing this tick to clear stale state afterward
      const dancingEntityIds = new Set<string>();

      for (const key of positions) {
        const pos = parseKey(key);
        const block = dim.getBlock(pos);

        // Jukebox was removed without script knowing (e.g. explosion) — clean up
        if (!block || block.typeId !== "minecraft:jukebox") {
          positions.delete(key);
          continue;
        }

        let isPlaying = false;
        try {
          const recordPlayer = block.getComponent("minecraft:record_player") as BlockRecordPlayerComponent | undefined;
          isPlaying = recordPlayer?.isPlaying() ?? false;
        } catch {
          // component unavailable in this context
        }

        if (!isPlaying) continue;

        // Spatial query — engine does the radius math, far cheaper than manual block scan
        const nearby = dim.getEntities({ families: ["plush"], location: pos, maxDistance: 8 });
        for (const entity of nearby) {
          const wasDancing = entity.getProperty("miku:is_dancing") ?? false;
          entity.setProperty("miku:is_dancing", true);
          if (!wasDancing) {
            const maxDances = getDanceCountForEntity(entity.typeId);
            entity.setProperty("miku:dance_index", Math.floor(Math.random() * maxDances));
          }
          dancingEntityIds.add(entity.id);
        }
      }

      // Clear dancing state on plushes not near any playing jukebox
      {
        const allPlushes = dim.getEntities({ families: ["plush"] });
        for (const entity of allPlushes) {
          if (!dancingEntityIds.has(entity.id)) {
            const wasDancing = entity.getProperty("miku:is_dancing") ?? false;
            if (wasDancing) entity.setProperty("miku:is_dancing", false);
          }
        }
      }
    }
  }, DANCE_CHECK_INTERVAL);
}
