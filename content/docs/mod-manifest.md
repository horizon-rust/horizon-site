# The mod package

Every current Horizon mod uses `horizon-mod.toml` at the root of a **`.hmod`** package. The [engine book's manifest reference](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/manifest.md) defines the fields and validation rules. Generate a project with [the authoring tool](/docs/make-a-mod), rather than copying a historical bundle.

## One manifest, three routes

- **Content** carries `assets/` and `data/`.
- **Native** carries a root Cargo project and Rust source, with `[native]` naming its exact Horizon build.
- **WebAssembly** carries `mod.wasm`. `cargo horizon-mod build --wasm` writes its `[wasm]` table, including the hash and toolchain identity; never write that table by hand.

A package cannot carry both native and wasm code. The SDK cache, build outputs and local credentials do not belong in the package. The [packaging chapter](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/native-mods.md) describes what the native package contains.

## Exact SDK and build compatibility

Native compatibility is an **exact pin**, not a minimum helper-counter or a promise that every later Nightly works. The native manifest pins `[native] horizon`; a wasm project's SDK pin is `[package.metadata.horizon] sdk` in `Cargo.toml`. Both are full commit hashes. Host, side and the pinned Rust toolchain matter too.

The [SDK project reference](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/sdk/03-in-a-project.md) documents the only accepted API dependency source: the SDK fetched under `.horizon/sdk/api/crates/`. A missing or mismatched SDK fails; the launcher does not silently choose another game or a legacy runtime.

The registry labels a native source version `native-1/<horizon>/<mixins>`, with exact revisions, and uses the existing `mod` kind for valid wasm packages. That index label is not permission to load native code into arbitrary builds. See [the index contract](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/registry-index.md).

## Native-only access

The typed API is the default. Native mods can additionally declare internals and use real `native.mixin` support for code outside that API. These are explicit, checked dependencies on the pinned engine, not a return to source-bundle helpers. Follow [the native route](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/native-route.md); it is unavailable on wasm.

Historical `.hnmod` bundles are not current-runtime packages. Renaming one does not convert it. They need a real source migration and a new checked `.hmod` release; archived release assets are not a compatibility fallback.

Check [release availability](/docs/make-a-mod#check-release-availability-first) before using the current-main workflow. Next: [Hooks, Host, handles and Parts](/docs/mod-code).
