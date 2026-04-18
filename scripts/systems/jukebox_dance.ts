import { world, system, BlockRecordPlayerComponent } from "@minecraft/server";
import { DIMENSION_IDS, getDanceCountForEntity } from "../utils/plush_registry";

const DANCE_CHECK_INTERVAL = 20;
const DANCE_SWITCH_MIN_TICKS = 12 * 20;
const DANCE_SWITCH_MAX_TICKS = 18 * 20;

// dimensionId -> Set of "x,y,z" position strings for tracked jukeboxes
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

const dancingPlushesByDimension = new Map<string, Set<string>>([
  ["overworld", new Set()],
  ["nether", new Set()],
  ["the_end", new Set()],
]);

// Entity id -> next system tick when that plush should pick a new dance.
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
  // Cross-addon: any addon can notify us when a custom disc starts/stops.
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
    customPlayingJukeboxes
      .get(normDimId(event.dimension.id))
      ?.delete(posKey(event.block.x, event.block.y, event.block.z));
  });

  // Lazily register existing jukeboxes from player interaction (back-compat with pre-existing worlds)
  world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    if (event.block.typeId !== "minecraft:jukebox") return;
    const set = jukeboxPositions.get(normDimId(event.block.dimension.id));
    if (set) set.add(posKey(event.block.x, event.block.y, event.block.z));
  });

  system.runInterval(() => {
    for (const dimId of DIMENSION_IDS) {
      const positions = jukeboxPositions.get(dimId);
      if (!positions || positions.size === 0) {
        const previousDancers = dancingPlushesByDimension.get(dimId);
        if (previousDancers) {
          for (const entityId of previousDancers) {
            const entity = world.getEntity(entityId);
            if (entity?.isValid && normDimId(entity.dimension.id) === dimId) {
              const wasDancing = entity.getProperty("miku:is_dancing") ?? false;
              if (wasDancing) entity.setProperty("miku:is_dancing", false);
            }
            nextDanceSwitchTicks.delete(entityId);
          }
          previousDancers.clear();
        }
        continue;
      }

      let dim: ReturnType<typeof world.getDimension>;
      try {
        dim = world.getDimension(dimId);
      } catch {
        continue;
      }

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
        const nearby = dim.getEntities({ families: ["plush"], location: pos, maxDistance: 16 });
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

      const previousDancers = dancingPlushesByDimension.get(dimId) ?? new Set<string>();
      for (const entityId of previousDancers) {
        if (!dancingEntityIds.has(entityId)) {
          const entity = world.getEntity(entityId);
          if (entity?.isValid && normDimId(entity.dimension.id) === dimId) {
            const wasDancing = entity.getProperty("miku:is_dancing") ?? false;
            if (wasDancing) entity.setProperty("miku:is_dancing", false);
          }
          nextDanceSwitchTicks.delete(entityId);
        }
      }

      dancingPlushesByDimension.set(dimId, dancingEntityIds);
    }
  }, DANCE_CHECK_INTERVAL);
}
