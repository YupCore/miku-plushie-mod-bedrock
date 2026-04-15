import { world, system, BlockRecordPlayerComponent } from "@minecraft/server";
import { getDanceCountForEntity } from "../utils/plush_registry";

const DANCE_CHECK_INTERVAL = 20;
const DANCE_SWITCH_MIN_TICKS = 12 * 20;
const DANCE_SWITCH_MAX_TICKS = 20 * 20;

// dimensionId → Set of "x,y,z" position strings for tracked jukeboxes
const jukeboxPositions = new Map<string, Set<string>>([
  ["overworld", new Set()],
  ["nether", new Set()],
  ["the_end", new Set()],
]);

// Jukeboxes currently playing a custom disc from VocaloidMusicPack (or any
// addon that fires the miku_plushie:jukebox_play/stop script events).
// recordPlayer.isPlaying() returns false for script-driven discs, so we track
// these separately and OR the two conditions in the dance loop.
const customPlayingJukeboxes = new Map<string, Set<string>>([
  ["overworld", new Set()],
  ["nether", new Set()],
  ["the_end", new Set()],
]);

// Entity id → next system tick when that plush should pick a new dance.
const nextDanceSwitchTicks = new Map<string, number>();

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

function nextDanceSwitchDelay(): number {
  return DANCE_SWITCH_MIN_TICKS + Math.floor(Math.random() * (DANCE_SWITCH_MAX_TICKS - DANCE_SWITCH_MIN_TICKS + 1));
}

function randomDanceIndex(maxDances: number, previous?: number): number {
  if (maxDances <= 1) return 0;
  let next = Math.floor(Math.random() * maxDances);
  if (previous !== undefined && next === previous) {
    next = (next + 1 + Math.floor(Math.random() * (maxDances - 1))) % maxDances;
  }
  return next;
}

export function startJukeboxDanceSystem(): void {
  console.log("[Miku Plushie] Starting jukebox dance detection system");

  // Cross-addon: VocaloidMusicPack (or any addon) notifies us when a custom
  // disc starts/stops. Completely decoupled — if neither addon is loaded, the
  // scriptevent is never fired and this subscriber never runs (no-op both ways).
  system.afterEvents.scriptEventReceive.subscribe(
    (event) => {
      try {
        const data = JSON.parse(event.message) as { x: number; y: number; z: number; dimId: string };
        const normId = normDimId(data.dimId);
        const key = posKey(data.x, data.y, data.z);
        if (event.id === "miku_plushie:jukebox_play") {
          jukeboxPositions.get(normId)?.add(key);
          customPlayingJukeboxes.get(normId)?.add(key);
        } else {
          customPlayingJukeboxes.get(normId)?.delete(key);
        }
      } catch {
        // malformed message — ignore
      }
    },
    { namespaces: ["miku_plushie"] }
  );

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

        const isCustomPlaying = customPlayingJukeboxes.get(dimId)?.has(key) ?? false;
        if (!isPlaying && !isCustomPlaying) continue;

        // Spatial query — engine does the radius math, far cheaper than manual block scan
        const nearby = dim.getEntities({ families: ["plush"], location: pos, maxDistance: 8 });
        for (const entity of nearby) {
          const wasDancing = entity.getProperty("miku:is_dancing") ?? false;
          const maxDances = getDanceCountForEntity(entity.typeId);
          entity.setProperty("miku:is_dancing", true);

          if (!wasDancing) {
            entity.setProperty("miku:dance_index", randomDanceIndex(maxDances));
            nextDanceSwitchTicks.set(entity.id, system.currentTick + nextDanceSwitchDelay());
          } else if (maxDances > 1 && system.currentTick >= (nextDanceSwitchTicks.get(entity.id) ?? 0)) {
            const previousDance = Number(entity.getProperty("miku:dance_index") ?? 0);
            entity.setProperty("miku:dance_index", randomDanceIndex(maxDances, previousDance));
            nextDanceSwitchTicks.set(entity.id, system.currentTick + nextDanceSwitchDelay());
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
            nextDanceSwitchTicks.delete(entity.id);
          }
        }
      }
    }
  }, DANCE_CHECK_INTERVAL);
}
