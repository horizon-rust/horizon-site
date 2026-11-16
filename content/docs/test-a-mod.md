# Test a mod

Use the [engine book's testing chapter](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/concepts/testing.md) for the current testing API. Test against the same exact SDK, game build, side and toolchain you intend players to use; a successful build on a different Nightly is not compatibility proof.

## Code mods

Keep pure logic in ordinary Rust unit tests. For hooks and Parts, use the book's supported test hosts and dispatch tools rather than copying the game's implementation or old helper functions.

For native code, build the root project against the prebuilt game:

```sh
horizon-launcher native-build . --instance "My Instance" --trust-native-code
```

For wasm, build the pinned module and package:

```sh
cargo horizon-mod build --wasm
```

Exercise the mod in the matching game. Check startup diagnostics, the Mods screen, the title screen and a world, the sides the mod supports, cancellation and interactions with dependencies. Check saving and restarting for persistent data. A refused wasm module must show its reason; native code is unsandboxed and a panic can stop the game.

## Content mods

Follow [the content tutorial](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/start/first-content-mod.md) to run a development folder. Check each block and item, recipes, drops, names and textures. Read `logs/latest.log`: a skipped resource is not proof that the whole package is correct.

## Check the package

Before submission, check the actual `.hmod` you will distribute:

```sh
cargo horizon-mod check target/horizon-mod/greeter.hmod
```

`check` validates the package; it does not prove gameplay correctness or that native source is safe. `--json` gives a machine-readable report; `--key <public key> --signature <file>.minisig` also checks a package signature. The [registry contract](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/registry-index.md) defines its additional publication checks.

If a pin has no signed SDK or prebuilt game, resolve that availability failure rather than checking an older runtime instead. See [release availability](/docs/make-a-mod#check-release-availability-first). Next: [publishing](/docs/publish-a-mod).
