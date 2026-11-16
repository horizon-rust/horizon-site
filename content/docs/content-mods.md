# Content mods

A content mod adds data and assets without executable mod code: blocks, items, recipes, loot, tags, models, textures and names. It is a folder during development and a **`.hmod`** when distributed, with `horizon-mod.toml` at its root.

## Start with the engine book

The [first content mod tutorial](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/first-content-mod.md) owns the working example and installation steps. The [content mod reference](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/content-mods.md) defines the supported data, namespace rules and limits; the [manifest reference](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/manifest.md) defines the manifest.

With [the authoring tool installed](/docs/make-a-mod#install-the-authoring-tool):

```sh
cargo horizon-mod new my_blocks --template content
cd my_blocks
cargo horizon-mod build
cargo horizon-mod check target/horizon-mod/my_blocks.hmod
```

The generated example is a better starting point than hand-copying a versioned manifest. The tool validates and packs the content; it does not compile a game.

## Try it and share it

Use the tutorial's development-folder workflow, and read `logs/latest.log` while checking blocks, recipes, drops, names and textures. For a packaged install, put the `.hmod` into `horizon-mods/` beside `options.txt`, and enable it through the launcher or `mod.<id>:true` in `horizon-mods.txt`. The game's Mods screen reports load failures; it is not an on/off switch.

The [installation chapter](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/installing.md) explains which content can reload immediately and which changes require a restart. Server-owned data still belongs to the server.

For behaviour rather than data, use the [native or wasm routes](/docs/make-a-mod) with Hooks, Host, handles and Parts. All three routes share `.hmod`, but content-only packages do not execute mod code.

The book tracks main: check [release availability](/docs/make-a-mod#check-release-availability-first), then [test](/docs/test-a-mod) and [publish](/docs/publish-a-mod) the package.
