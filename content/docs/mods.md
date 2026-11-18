# Mods and data packs

Horizon has its own mods, made for Horizon and not compatible with Java mods. Data packs work in part. This page says what you can do with each today.

## Mods

Horizon has three kinds of mod, all in one file format, `.hmod`:

- **Content mods** add blocks and items from data and assets: models, textures, recipes, loot tables, tags and structures, with no code. This is also what the launcher's [modpack](/docs/modpacks) carry-over produces.
- **Native mods** are Rust code that the launcher compiles on your computer: a HUD, keys, commands, settings, new behaviour. They are not sandboxed.
- **WebAssembly mods** are code that the game runs in a sandbox, with limits on time and memory. You need no Rust: the game compiles a mod's `mod.wasm` itself the first time and keeps the result in a cache ([Compiled module cache](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/wasm-mods.md#compiled-module-cache)).

Old native mods in the `.hnmod` format don't load in current launchers; their authors republish them as `.hmod`.

> **Early.** Reviewed mods are listed at [playhorizon.dev/mods](/mods) and on the launcher's Mods page.

**Installing a mod**

1. Pick an instance on the left of the launcher, and install the mod from its **Mods** page (pick **Horizon** beside Modrinth). Or copy the file by hand into the game folder (the folder that holds `options.txt`; see [Install](/docs/install#first-launch)): content and WebAssembly mods go in `horizon-mods/`, native mods in `horizon-native-mods/`.
2. Turn it on. A mod you install from the Mods page is on at once. A mod you copied in by hand is off until you add a line `mod.<id>:true` to `horizon-mods.txt`, beside `options.txt`.
3. Start the game again. A mod that adds blocks, items or world generation loads when the game starts.

The game's **Mods** screen (on the title screen, and in **Options > Mods**) lists each installed mod with its details, a **Config** button for a mod with settings, and, for a mod that could not load, the reason in red. It has no on/off switch: the launcher and `horizon-mods.txt` decide which mods run. [Installing and using mods](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/installing.md) has the details.

**Native mods**

A native mod is code, not sandboxed: it can do anything you can on your computer. So the launcher builds it only for the instance you install it in, and only when you say so. The first time, it tells you what native mods are. Before each build it names the mods and their versions in a red warning; build only mods you trust. The launcher compiles the mods against the prebuilt game of the instance's Horizon build: the game itself is not rebuilt.

On a server you join, a mod that runs on both sides must match the server's: the game names the missing, extra or different mods. A dedicated server runs native mods from a server build the launcher exports ([Multiplayer](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/native-mods/11-multiplayer.md)).

Install only mods whose authors you trust. Every mod on the registry was reviewed by a person, and a native mod's source also gets a security review. Each mod's page says who made it.

**Making a mod**

[Make a mod](/docs/make-a-mod) is the full guide, for every kind: the tool, your mod in the game, mod code, content mods, testing, and publishing on [the registry](/mods).

Java mod jars don't run in Horizon: their code calls and patches Minecraft's Java classes, and Horizon has none. What carries over is the data and assets inside a jar ([modpacks](/docs/modpacks)).

## Finding resource packs and modpacks

The launcher's **Mods** page (launcher 0.17 and newer) searches [Modrinth](https://modrinth.com) for what Horizon can load: resource packs and modpacks. Each result says how well it runs in Horizon (**Works**, **Partly**, or **Doesn't run**), and by default the page shows only what runs. **Install** downloads the file, checks it against the checksum Modrinth lists and refuses anything that does not match, then puts it in the right folder, with the packs it needs. **Update** and **Remove** are there too. A resource pack still has to be turned on in the game's Resource Packs screen. A modpack is imported on the [Modpacks page](/docs/modpacks).

CurseForge support is coming soon: the page shows it, but doesn't search it yet. The same things work from a terminal: `horizon-launcher mods search`, `install`, `update` and `remove`.

## Java mods from the Mods page (next launcher release)

Java code does not run in Horizon, but much of what a mod adds is data: blocks, items, recipes, loot tables, tags, worldgen, textures. From the next launcher release, the Mods page also lists Fabric, NeoForge and Forge mods made for 26.3 and, before offering one, downloads its jar, checks it against Modrinth's checksum and reads it (without running it) to say what of it Horizon runs:

- **Works**: the mod is only content, and all of it carries over.
- **Partly**: its content carries over; the row lists what does not, such as machines and containers, mobs, blocks or items with behaviour of their own, recipe types of its own, or Mixins.
- **Doesn't run**: there is nothing to carry over (performance mods, libraries, mods that are all code). It is not offered.

**Install** brings the mod over into `horizon-mods` and turns it on; start the game again to load it. Blocks take the closest vanilla block's shape, hardness and sounds, so a carried-over block can break faster or slower than in Java. Most popular mods today are **Partly** or **Doesn't run**: the verdict is the honest answer for each one.

## Data packs

A world's data packs go in its `datapacks` folder, as folders or `.zip` files with a `pack.mcmeta`, as in vanilla.

**Works today (single player and open-to-LAN worlds):**

- **Functions** (`.mcfunction`, with macros and line continuation), **function tags** (such as `minecraft:load` and `minecraft:tick`), **predicates** and **item modifiers**.
- The `/function`, `/datapack` and `/reload` commands, and the choice of which packs are on, kept with the world.

**Not applied from data packs yet:** custom recipes, loot tables, advancements and world generation. Horizon reads those from the vanilla data it prepared, and from content mods.

Vanilla's own data is always on, and it matches vanilla: every command runs as vanilla does, and recipes, loot and world generation are checked against the real game.
