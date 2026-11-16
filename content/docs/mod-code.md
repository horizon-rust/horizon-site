# Hooks, Host, handles and Parts

The [engine's modding book](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/introduction.md) owns the API examples and signatures. Native and WebAssembly mods use the same generated API through `horizon-mod-api`; do not import `horizon-client`, copy old helper functions or generate a second dispatch convention.

## Hooks and typed hosts

Implement only the `mod_api::Hooks` methods your mod needs. `#[mod_api::horizon_mod]` on the root implementation records its subscriptions. A hook receives its event and, where applicable, a typed host: `ClientHost` or `ServerHost` enforces the side at compile time; level hooks have access-specific hosts.

Start with [writing hooks](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/writing-hooks.md), then read [Hooks and the Host](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/hooks-and-the-host.md) for cancellation, priority, shared state and re-entrancy. Use those chapters' complete examples rather than historical helper-counter snippets.

## Handles and capabilities

The host is the entry point to the game. Handles identify game objects without exposing the game's Rust implementation; their operations take the appropriate host and access capability. Read [the introduction](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/introduction.md) and [capabilities](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/capabilities.md) for checked access. Do not retain borrowed game state across hooks.

## Parts and attachments

Global events belong in `Hooks`. Behaviour scoped to a registered block, item, block entity, menu or fluid belongs in a **Part**, called only for that object. Read [Parts](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/parts.md) for registration and examples.

[Attachments](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/attachments.md) hold a mod's own data on game objects, including persistence where supported. They replace attempts to patch object layout for ordinary mod state.

## Native and wasm

Use [the native tutorial](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/first-mod.md) for a source mod against an exact SDK/prebuilt-game pin. Use [the wasm tutorial](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/first-wasm-mod.md) to compile the same API to `mod.wasm`. Wasm excludes native-only internals and items marked **Not on wasm**.

The [API reference](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/api.md) is the entry point for available types. Catalog-generated hooks and Parts are the source of repeated signatures; do not hand-maintain copies in your mod or this site.

For access beyond the API, native mods can use the explicit [native route](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/native-route.md), including `native.mixin`. That route remains exact-build, native-only and unsandboxed.

These links track main; check [release availability](/docs/make-a-mod#check-release-availability-first). Next: [testing](/docs/test-a-mod).
