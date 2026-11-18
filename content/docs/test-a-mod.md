# Test a mod

A few checks catch most mistakes before players see them: unit tests for a code mod, `cargo horizon-mod check`, and the game with your mod in it.

## Code mods

### Unit tests

Code that doesn't call the game (formatting, maths, parsing a command's arguments) is ordinary Rust: test it with `#[test]` and `cargo test`.

For code that calls the game, turn on the `testing` feature of `horizon-mod-api` in your test dependencies. `mod_api::testing::FakeHost` is a host without the game: set up players, blocks and items in its fakes, call your code with it, then look at what changed. [Testing a mod](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/testing.md) has an example.

### Check it

In the mod's folder:

```sh
cargo horizon-mod check
```

It checks the package rules, runs `cargo check` for your computer and for WebAssembly against the pinned SDK, and says what the mod uses of the API. The WebAssembly check needs Rust's `wasm32-unknown-unknown` target: `rustup target add wasm32-unknown-unknown`. `cargo horizon-mod fits` says whether the mod still fits the current Nightly; a mod's own scheduled CI can run it to learn of a break before players do. For a mod made for exactly one build (one with native tables or internals) it answers "cannot tell" instead of a verdict ([Commands](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/sdk/05-commands.md)).

### In the game

Build and play it as on [Make a mod](/docs/make-a-mod#see-it-in-the-game): `horizon-launcher native-build` for a native mod, or the `.hmod` in `horizon-mods/` for a WebAssembly mod. Things to try each time:

- **Options > Mods**: your mod's row, its details, and its **Config** page if it has settings. A mod that could not load shows the reason in red.
- Every command, with no arguments, with good ones and with wrong ones.
- Single player, a LAN world and a server. In single player the server's hooks run in your game too ([Multiplayer](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/native-mods/11-multiplayer.md)).
- Quitting and starting again, for a mod that keeps settings or data.

A native mod runs inside the game, so a panic in your code stops the game. Use `Option` and `Result` for what can go wrong.

## Content mods

Start the game with your mod as a dev mod ([how](/docs/content-mods#try-it-and-share-it)) and read the log (`logs/latest.log` in the game folder): a file the game can't read is logged and skipped. After each change to the files, start the game again. Things to try:

- Each block: place it, mine it with and without the right tool, and look at what it drops.
- Each recipe in a crafting table or furnace, and in the recipe book.
- The names and textures, in the inventory and in the world.

## Check it as the registry does

Before you publish, run what the registry runs on the file you will submit:

```sh
cargo horizon-mod check target/horizon-mod/greeter.hmod
```

It checks the file's size and SHA-256, its manifest and its content, without running any code. It also checks modpacks (`.hpack`), resource packs (`.zip`) and shader packs (`.hshader`).

- `--json` prints the report as JSON, for scripts.
- `--key <public key> --signature <file>.minisig` also checks your signature ([Publish](/docs/publish-a-mod#sign-it)).

The registry's checks run the same `check`, and a few of their own ([its README](https://github.com/horizon-rust/horizon-mods#submit)). A person still reviews every mod, and a native mod's source gets a security review ([Publish](/docs/publish-a-mod)).

Next: [publish it](/docs/publish-a-mod).
