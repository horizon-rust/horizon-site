# Mods and data packs

Horizon mods target Horizon, not Java's Fabric, NeoForge or Forge runtimes. The [engine book's installation chapter](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/installing.md) is the authoritative guide to the current mod loader.

## Mods

All current mod routes use **`.hmod`**:

| Route | Manual installation, beside `options.txt` | Runs as |
| --- | --- | --- |
| Content: data and assets | `horizon-mods/` | No executable mod code |
| WebAssembly: a package with `mod.wasm` | `horizon-mods/` | Sandboxed code, with runtime limits |
| Native: a package with Rust source | `horizon-native-mods/` | Code compiled against the exact prebuilt game, with your rights |

**Release availability:** the book describes main. These instructions do not mean the current public Nightly, SDK, launcher and registry have all shipped the new runtime. Check [release notes](/releases) and the [SDK requirements](/docs/make-a-mod#check-release-availability-first) for the exact build you use. A missing matching SDK is an error, not a reason to select an older runtime. Historical `.hnmod` bundles are not supported current-runtime packages.

## Install and enable

1. Pick the instance in the launcher and install from its **Mods** page. The registry and launcher must support the package's runtime and exact build. You can also copy the `.hmod` to the folder in the table.
2. Turn it on in the launcher, or use `horizon-launcher mods enable <project>`. A manually copied mod is enabled by `mod.<id>:true` in `horizon-mods.txt`, beside `options.txt`.
3. For native source, build for that instance only after reviewing the named code and accepting the native-code warning. The launcher uses the pinned SDK/toolchain and prebuilt game; it does not rebuild the full game for every mod.
4. Start the instance. **Options > Mods** lists installed mods, settings where supplied, and load failures with a reason. That screen has no on/off switch.

Native code, including its build scripts and procedural macros, is **not sandboxed**: it can read files and use the network with your rights. Install only source you trust. A package signature and registry review are not a sandbox.

The game's **Options > Mods > Browse Mods** installs content mods only; native and wasm packages use the launcher or manual installation. Asset-only and reloadable content may reload immediately, while registry or world-generation changes require a restart. See the [installation chapter](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/installing.md) for the exact reload rules.

## Make a mod

[Make a mod](/docs/make-a-mod) maps content, native and wasm authoring to the engine book's SDK, Hooks, Host, handles and Parts guides. [Publishing](/docs/publish-a-mod) covers checked packages and the registry.

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
