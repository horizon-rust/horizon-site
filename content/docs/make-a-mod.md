# Make a mod

This guide takes you from nothing to a mod that other players can install. You need no Minecraft modding experience. The full reference is [the modding book](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/introduction.md) in Horizon's repository; these pages are the short version.

## Three kinds of mod, one file

Every Horizon mod is one `.hmod` file: a zip holding a `horizon-mod.toml` manifest, the mod's `assets/` and `data/`, and, for a code mod, its Rust source or a compiled `mod.wasm`.

| | Content mod | Native mod | WebAssembly mod |
| --- | --- | --- | --- |
| **What it holds** | `assets/` and `data/`: blocks, items, recipes, loot, tags, models, textures, world generation | A Rust crate on the mod API, beside its content | `mod.wasm`, built from the same Rust |
| **How it runs** | The game reads it at start-up | The launcher compiles it on the player's computer against the prebuilt game the instance plays. The game itself is not rebuilt | The game runs it in a sandbox, with limits on time and memory |
| **Safety** | Data only: it runs nothing | Not sandboxed: it can do anything the player can | Sandboxed |
| **Compiler on the player's computer** | No | Yes: the launcher's own, after the player allows native code | No |

**Pick a content mod** when what you add is a block, an item, a recipe or a structure. [Content mods](/docs/content-mods) has the whole guide.

**Pick a code mod** when the mod has to do something: react to a player, add a command, draw on the screen. Native and WebAssembly mods use the same API (`mod_api`, the `horizon-mod-api` crate) and the same source; only the build differs. A WebAssembly mod can't use the [native route](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/native-route.md) or an API item the [API reference](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/api.md) marks **Not on wasm**. Hooks, Parts, attachments and dependencies work the same on both.

A Horizon mod is not a Java mod. Fabric, NeoForge and Forge jars don't run in Horizon. What carries over from a Java mod is its data and assets ([modpacks](/docs/modpacks)).

## Install the tool

Every kind of mod is made with `cargo horizon-mod`. You need [Rust](https://rustup.rs) 1.95 or newer:

```sh
cargo install --locked --git https://github.com/horizon-rust/horizon cargo-horizon-mod
```

To play with your mod you also need the [launcher](/docs/install) with an instance. A native mod is compiled by the launcher with its own Rust, not yours. A WebAssembly build installs its pinned Rust through rustup the first time.

## Make one

```sh
cargo horizon-mod new my-blocks                       # a content mod
cargo horizon-mod new greeter --template native       # a native mod
cargo horizon-mod new greeter --template wasm         # a WebAssembly mod
```

A code mod is pinned to the game build of the current Nightly (or `--horizon <build>`), and `new` fetches that build's SDK into `.horizon/sdk/`. Keep that folder out of git; after a fresh clone, run `cargo horizon-mod check` in the project to fetch it again. `cargo horizon-mod update` moves the pin to a newer build.

A native project:

```
greeter/
├── horizon-mod.toml     the manifest: id, version, and [native], the exact Horizon build
├── Cargo.toml           depends on horizon-mod-api in .horizon/sdk/, never on the game
├── src/lib.rs           the hooks
├── assets/
└── data/
```

## See it in the game

A native mod, built by the launcher for an instance:

```sh
horizon-launcher native-build . --instance "My Instance" --trust-native-code
```

Install the instance's Horizon build first, then choose **Prepare & play** in the launcher or run `horizon-launcher prepare --version <version>`. The first build fetches that build's SDK and the launcher's own Rust tools, which can be several hundred MB.

`--trust-native-code` records that you allow native code on this install: the mod runs with your rights. Run `native-build` again after each edit; a failed build's compiler output is in the [build log](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/native-mods/05-build-log.md).

A WebAssembly mod: `cargo horizon-mod build --wasm`, then copy `target/horizon-mod/<id>.hmod` into the game folder's `horizon-mods/` and add the line `mod.<id>:true` to `horizon-mods.txt`, beside `options.txt`.

A content mod: [Try it and share it](/docs/content-mods#try-it-and-share-it).

## The path

1. **Set up** (this page): the tool, a project, your mod in the game.
2. **[The manifest](/docs/mod-manifest)**: `horizon-mod.toml` and the `.hmod` file.
3. **[Mod code](/docs/mod-code)**: hooks, the `Host`, and where to find the API.
4. **[Content mods](/docs/content-mods)**: blocks, items, recipes and textures from data files.
5. **[Test it](/docs/test-a-mod)**: unit tests, the checks, and the game with your mod in it.
6. **[Publish it](/docs/publish-a-mod)**: put it on the registry.

## Missing something?

If your mod needs a hook or an API that doesn't exist yet, [open an issue](https://github.com/horizon-rust/horizon/issues/new) on horizon-rust/horizon with a title that starts with `mod API:`, and say what the mod needs to do.

Next: [the manifest](/docs/mod-manifest).
