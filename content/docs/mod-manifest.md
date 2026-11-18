# The manifest

Every Horizon mod has one manifest, `horizon-mod.toml`, at the root of its folder and of its `.hmod` file. It is the only place the mod's id and version come from: Cargo's package name and version don't count. The full rules are in the book's [manifest and package reference](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/manifest.md).

## The shared fields

Every kind of mod starts the same way:

```toml
id = "greeter"
name = "Greeter"
version = "0.1.0"
description = "Says hello to every player who joins"
authors = ["You"]
license = "MIT"
api = "0.2"
side = "both"
capabilities = ["registries"]
```

| Key | What it is |
| --- | --- |
| `id` | 1 to 64 characters of `a-z`, `0-9` and `_`. It is also the namespace of the mod's files (`greeter:…`). Keep it once you have published the mod. |
| `name`, `description`, `authors` | What the Mods screen shows. |
| `version` | Such as `0.1.0`. Each version you publish needs a new one. |
| `license`, `homepage`, `issues` | Optional. The Mods screen shows the licence, and **Homepage** and **Issues** open the links. |
| `api` | Exactly `"0.2"`. |
| `side` | `"client"` (the default), `"both"` or `"server"`. |
| `capabilities` | `["registries"]`. |

Unknown keys are refused, so a typo is an error, not something silently ignored. The book's [content mods page](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/content-mods.md#the-manifest) lists every optional key.

## Code mods

A **native mod** adds a `[native]` table: the Minecraft version and the exact Horizon build the mod is made for. `cargo horizon-mod new --template native` writes it, and `cargo horizon-mod update` moves it to a newer build. Native mods can also declare injections and other native tables ([Injections](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/injections.md), [the native route](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/native-route.md)).

A **WebAssembly mod** has a `[wasm]` table instead, with `mod.wasm`'s hash and the Rust it was built with. `cargo horizon-mod build --wasm` writes it; never edit it by hand. Its build is pinned in `Cargo.toml`, under `[package.metadata.horizon] sdk`.

A mod has native code or WebAssembly, never both.

## Dependencies

A mod names the mods it needs by id, with a version requirement:

```toml
[dependencies]
base = "^1.2"
extra = { version = "^2", optional = true }
```

Versions are the other mod's `horizon-mod.toml` versions. A missing required mod, a version that doesn't match, or a cycle stops the game from loading the mods, with the reason. [Dependencies between mods](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/dependencies.md) covers sides and load order.

## The .hmod file

`cargo horizon-mod build` packs the project into `target/horizon-mod/<id>.hmod`. It is a zip with a flat layout, no folder named after the mod inside it:

```
greeter.hmod
├── horizon-mod.toml
├── icon.png         optional: a square PNG, at most 512 × 512 and 256 KiB
├── assets/greeter/
├── data/greeter/
├── Cargo.toml       code mods
├── src/lib.rs       code mods
└── mod.wasm         WebAssembly mods
```

A native mod's `.hmod` is its source: the launcher compiles it on the player's computer. A WebAssembly mod's carries `mod.wasm` and the source it was built from.

Next: [mod code](/docs/mod-code).
