# Publish a mod

Publish an explicit, checked **`.hmod`** version, with public source and a suitable licence. The [engine book's publishing chapter](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/publish.md) and [registry contract](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/reference/registry-index.md) are authoritative.

## Before you submit

1. Set a new version in `horizon-mod.toml`. Published files are pinned and never replaced.
2. Build the package with `cargo horizon-mod build`, or `cargo horizon-mod build --wasm` for WebAssembly. Native packages carry the checked root Cargo project and source, not a rebuilt game or an SDK cache.
3. Run `cargo horizon-mod check target/horizon-mod/<id>.hmod` on the exact file you will submit, and [test it in the matching game](/docs/test-a-mod).
4. Publish the source under a licence identified by an [SPDX expression](https://spdx.org/licenses/).

Code-mod publication also needs the exact signed SDK, matching prebuilt game and supported launcher. These docs track main; do not treat them as confirmation that a candidate has reached the public registry or Nightly. Check [release availability](/docs/make-a-mod#check-release-availability-first).

## Sign it

The registry supports [minisign](https://jedisct1.github.io/minisign/) package signatures. Keep your private key private. When a project has a public key, later versions must verify with that key; do not confuse an author's package signature with Horizon's separate SDK signing authority.

```sh
minisign -S -s horizon-mods.key -m target/horizon-mod/greeter.hmod
cargo horizon-mod check target/horizon-mod/greeter.hmod --key "<your public key>" --signature target/horizon-mod/greeter.hmod.minisig
```

The [integrity and signing rules](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/how-to/publish.md#integrity-and-signing) explain package checks and takedowns.

## Submit and update

Open [the submission form](/mods/submit), sign in with GitHub and supply the page, source, licence, explicit version file and any signature. Choose **Mod** for content or wasm; choose **Native mod** for native source. Both use `.hmod`; there is no separate wasm catalogue kind.

The service opens a pull request. Checks and review must complete, and the registry's publication job must succeed before the version appears in the live index and launcher. A merge alone is not proof of deployed availability. Submit later versions through the same form; never replace an existing version's file.

Historical `.hnmod` releases are archived history, not installable current-runtime packages. A migrated native mod needs its own new, reviewed `.hmod` release.

## Reports and takedowns

Report a project from its page. The launcher's registry checks refuse revoked files and disable installed revoked versions with a reason.
