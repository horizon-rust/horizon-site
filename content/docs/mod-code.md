# Mod code

A code mod, native or WebAssembly, is one Rust crate whose root implements `mod_api::Hooks`. This page shows the shape of that code and where to find the rest. The book's [Writing hooks](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/writing-hooks.md) has the full rules.

## A first mod

`cargo horizon-mod new greeter --template native` writes this `src/lib.rs`. It greets every player who joins:

```rust
use mod_api::{self, Hooks, PlayerLoggedInEvent, ServerHost, Text};

#[derive(Default)]
struct Mod;

#[mod_api::horizon_mod]
impl Hooks for Mod {
    /// A player joined the server: greet them.
    fn player_logged_in(&self, host: &mut dyn ServerHost, event: &mut PlayerLoggedInEvent<'_>) {
        let line = format!("greeter says hello, {}!", event.name);
        if let Some(player) = host.player(event.player) {
            let _ = player.tell(host, Text::literal(line));
        }
    }
}
```

- Each method of `Hooks` is one moment in the game. Implement only the ones you need; the game calls your mod only for those.
- `#[mod_api::horizon_mod]` marks the one `impl Hooks`, at the crate root. Don't write a `hooks()` function yourself.
- The **host** is your handle on the game. A server hook gets a `ServerHost`, a client hook a `ClientHost`, so a call on the wrong side doesn't compile.
- The **event** carries the moment's data. The fields you may change are writable.
- `Cargo.toml` depends on `horizon-mod-api` in `.horizon/sdk/`, never on the game's own crates.

The same file builds as a WebAssembly mod (`--template wasm`, then `cargo horizon-mod build --wasm`).

## The pieces

| You want to | Read |
| --- | --- |
| React to a moment: a tick, a command, a block broken | [Hooks and the Host](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/hooks-and-the-host.md) |
| Give your own blocks, items or entities behaviour | [Parts](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/parts.md) |
| Keep data on a player, an entity, a block entity, a chunk or a level | [Attachments](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/attachments.md) |
| Move items, fluids or energy between blocks | [Capabilities](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/capabilities.md) |
| Let players change options | [Config files and settings](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/mod-settings.md) |
| Draw, play sounds, read keys | [Client, rendering and sound](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/client.md) |
| Call another mod | [Dependencies between mods](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/dependencies.md) |
| Run before or after other mods, or cancel an event | [Writing hooks](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/writing-hooks.md#order-between-mods) |
| Reach the game's own code (native mods only) | [The native route](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/native-route.md) |

## Finding a hook

In a mod's folder, `cargo horizon-mod hooks <text>` searches the pinned build's hooks offline, by name, by description and by their NeoForge, Fabric and Paper names: `cargo horizon-mod hooks block break`. `--all` searches the whole API.

Every hook, event, Part and `Host` method is in the rustdoc of `horizon-mod-api`. [The mod API reference](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/api.md) says how to open it and where to start.

If what your mod needs isn't there, [open an issue](https://github.com/horizon-rust/horizon/issues/new) on horizon-rust/horizon with a title that starts with `mod API:`.

## Mods and Nightlies

A mod is made for the build it pins. A native mod that uses only the mod API (no nested `[native.*]` tables and no declared game internals) also runs on later builds where nothing it uses changed: the launcher checks and compiles it there. `cargo horizon-mod fits` tells you whether your mod fits the current Nightly, and `cargo horizon-mod update` lists what a newer build breaks in it, line by line, before it moves the pin. [Checking a mod against a build](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/native-mods/14-checking-a-mod-against-a-build.md) has the details.

Next: [content mods](/docs/content-mods).
