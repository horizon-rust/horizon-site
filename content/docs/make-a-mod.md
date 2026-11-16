# Make a mod

Start with the [engine's modding book](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/introduction.md). It is the authoritative guide to the manifest, SDK and API; these pages help you choose a route and find the right chapter, rather than maintain a second API tutorial.

## Check release availability first

The book tracks Horizon's **main branch**, not a promise that the current public Nightly has shipped it. Code mods need a matching signed SDK and prebuilt game, a launcher that supports that build, and registry support before registry installation is usable. Check the [release notes](/releases) and the [SDK release contract](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/sdk/01-release.md). A missing SDK is an error: do not substitute an older API or rebuild the whole game as a fallback.

## Choose a route

| Route | Package | Build and trust |
| --- | --- | --- |
| Content | `.hmod` with data and assets | No mod code or compiler |
| Native | `.hmod` with Rust source | Compiled against the exact build's prebuilt game; runs with your rights |
| WebAssembly | `.hmod` with `mod.wasm` | Built with the pinned SDK/toolchain; runs in the game's sandbox |

Native and wasm use the same **Hooks, Host, handles and Parts** API. A mod carries native code or WebAssembly, never both. Java mod jars do not run in Horizon; their data and assets can sometimes be [carried over](/docs/modpacks).

## Install the authoring tool

With [Rust](https://rustup.rs) and Git installed:

```sh
cargo install --git https://github.com/horizon-rust/horizon cargo-horizon-mod
```

Use the tool and book from the same engine revision when working on an unreleased build. The [SDK project guide](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/sdk/03-in-a-project.md) explains exact pins, verified downloads, mirrors and editor setup.

## Make your first mod

- **[Content tutorial](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/first-content-mod.md)**: `cargo horizon-mod new my_blocks --template content`.
- **[Native tutorial](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/first-mod.md)**: `cargo horizon-mod new greeter --template native`.
- **[WebAssembly tutorial](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/first-wasm-mod.md)**: `cargo horizon-mod new greeter --template wasm`, then `cargo horizon-mod build --wasm`.

For code mods, the generated project depends on `horizon-mod-api` under `.horizon/sdk/`, **not** `horizon-client` or another game crate. The tool fetches that pin's SDK; do not commit or package `.horizon/`.

For native development, the book's build command is:

```sh
horizon-launcher native-build . --instance "My Instance" --trust-native-code
```

It compiles the mod against the pinned prebuilt game, not a full game rebuild for each mod. Trust only source you have reviewed: native code, build scripts and procedural macros run with your rights.

Next: [the package and exact compatibility](/docs/mod-manifest), [the API map](/docs/mod-code), [testing](/docs/test-a-mod) and [publishing](/docs/publish-a-mod).
