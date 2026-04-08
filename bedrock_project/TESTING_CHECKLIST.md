# Miku Plushie Bedrock - Testing Checklist

## Phase 8: Polish, Sub-Packs & Testing

This document contains the comprehensive testing checklist for the Miku Plushie Bedrock Edition conversion.

## Pre-Testing Setup

1. [ ] Both behavior pack and resource pack loaded in Minecraft Bedrock
2. [ ] No content log errors on world load
3. [ ] Scripts loaded successfully (`/scriptevent miku:ping` returns success)

---

## Block Testing

### Plush Blocks (98 total)
- [ ] All 98 plush blocks placeable
- [ ] Correct rotation on placement (4 directions)
- [ ] Correct textures for each variant
- [ ] Ghost variant (miku_plush_ghost, teto_plush_whatchacallitsname) has translucency
- [ ] Custom collision box (not full block)
- [ ] Custom selection box (correct for interaction)
- [ ] Placement plays "oie" sound
- [ ] Breaking plays "bye" sound
- [ ] Vocaloid heart spawns entity and destroys block

### Leek Crops
- [ ] Leek crop grows through all 8 stages (0-7)
- [ ] Bone meal accelerates growth
- [ ] Mature leek can be harvested
- [ ] Wild leek crop generates in taiga biomes
- [ ] Wild leek cannot be bonemealed

---

## Entity Testing

### All 11 Plush Entities
- [ ] Miku plush spawns via spawn egg
- [ ] Teto plush spawns via spawn egg
- [ ] Akita Neru plush spawns via spawn egg
- [ ] Aiko plush spawns via spawn egg
- [ ] Rin plush spawns via spawn egg
- [ ] Len plush spawns via spawn egg
- [ ] Konoha plush spawns via spawn egg
- [ ] Luka plush spawns via spawn egg
- [ ] Meiko plush spawns via spawn egg
- [ ] Gumi plush spawns via spawn egg
- [ ] Kaito plush spawns via spawn egg

### Entity Behavior
- [ ] Can be tamed with leek
- [ ] Tamed entities follow owner
- [ ] Owner can make entity sit/stand (right-click)
- [ ] Entities attack hostile mobs with owner
- [ ] Entities retaliate when hurt
- [ ] Entities do NOT attack plushies
- [ ] Entities do NOT attack Creepers
- [ ] Entities do NOT attack Ghasts
- [ ] Entities pick up swords from ground
- [ ] Owner can retrieve held items (sneak + empty hand)
- [ ] Owner can heal with leek

### Entity Animations
- [ ] Idle animation plays
- [ ] Sit animation plays when sitting
- [ ] Attack animation plays on attack
- [ ] Spawn animation plays on spawn
- [ ] Health-dependent body lean works
- [ ] Procedural limb animations working

### Dance System
- [ ] Entities dance near jukeboxes
- [ ] Miku has 5 dance options
- [ ] Teto has 4 dance options
- [ ] Neru has 3 dance options
- [ ] Others have caramelldansen

### Miku-Specific
- [ ] Miku eats nearby leek crops when hurt
- [ ] Eating animation plays
- [ ] Leek is consumed after eating

### Variant System
- [ ] Entity texture matches block variant
- [ ] Multiple geometries work correctly

---

## Item Testing

### Food Items
- [ ] Leek is consumable (4 nutrition)
- [ ] Baguette is consumable (8 nutrition)
- [ ] Eating has correct animation

### Tools
- [ ] Teto pickaxe mines pickaxe-breakable blocks
- [ ] Teto pickaxe has correct durability (500)
- [ ] Teto pickaxe can be repaired with diamond
- [ ] All 11 pickaxe variants work

### Special Items
- [ ] Vocaloid heart interaction works
- [ ] Canudinho shows rare rarity
- [ ] Akita Neru phone displays correctly

---

## Crafting & Recipes

- [ ] Base Miku plush recipe works
- [ ] All variant recipes work (shapeless)
- [ ] Teto pickaxe recipe works
- [ ] Canudinho recipe works
- [ ] Baguette recipe works
- [ ] Vocaloid heart recipe works

---

## Sound Testing

- [ ] Placement sound plays for each character
- [ ] Break sound plays for each character
- [ ] Attack sound plays when hitting with plush
- [ ] Equip sound plays when placing on head
- [ ] Tame sound plays when taming
- [ ] Miku specific sounds (canudinho, eat) work

---

## Particle Effects

- [ ] Spawn particle plays on entity spawn
- [ ] Particle has correct animation (8-frame flipbook)

---

## World Generation

- [ ] Leek patches spawn in taiga biomes
- [ ] Leek patches spawn in old growth spruce taiga
- [ ] Correct spawn frequency (1-in-8 chunks)

---

## Villager Trades

- [ ] Farmer sells leek seeds (level 1)
- [ ] Farmer buys leek (level 1)
- [ ] Wandering trader offers random plush

---

## Commands

- [ ] `/scriptevent miku:spawn_mikus` spawns all items/entities
- [ ] `/scriptevent miku:ping` returns success

---

## Localization

- [ ] English (en_US) displays correctly
- [ ] Portuguese (pt_BR) displays correctly
- [ ] Chinese (zh_CN) displays correctly
- [ ] All custom names translated
- [ ] All subtitles translated

---

## Sub-Packs

### Legacy Textures
- [ ] Sub-pack appears in pack settings
- [ ] Legacy textures override base textures
- [ ] All legacy variants work

### English Dub
- [ ] Sub-pack appears in pack settings
- [ ] English voices override Japanese voices
- [ ] All voice lines play correctly

---

## Performance Testing

- [ ] 50+ plush entities don't cause tick lag
- [ ] Jukebox dance polling doesn't cause lag
- [ ] Miku eat-leek checking doesn't cause lag
- [ ] Entity count remains stable over time

---

## Packaging

- [ ] `.mcaddon` file created successfully
- [ ] Clean installation works on fresh world
- [ ] Pack dependencies resolve correctly
- [ ] Both BP and RP included in package

---

## Known Issues (To Address)

1. Head equipment: Not implemented (Bedrock limitation)
2. Emissive textures: Baked into base texture for Aiko
3. Cloud texture override: Not applicable to Bedrock

---

## Test Results Summary

| Category | Pass | Fail | Notes |
|----------|------|------|-------|
| Blocks | | | |
| Entities | | | |
| Items | | | |
| Recipes | | | |
| Sounds | | | |
| Particles | | | |
| World Gen | | | |
| Commands | | | |
| Localization | | | |
| Sub-packs | | | |
| Performance | | | |
| Packaging | | | |

---

## Sign-Off

- [ ] QA Passed
- [ ] Ready for Release
