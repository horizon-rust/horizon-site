# Publish a mod

Horizon's registry lists mods, modpacks and resource packs made for Horizon. Players find them at [playhorizon.dev/mods](/mods) and on the launcher's Mods page, which checks every file against the SHA-256 the registry lists before it installs it. A person reviews each project before it is published. The registry lives in [horizon-rust/horizon-mods](https://github.com/horizon-rust/horizon-mods).

## Before you submit

1. **Choose a version.** Set `version` in `horizon-mod.toml`, such as `1.0.0`. Every version you publish needs a new one, and a published file never changes.
2. **Make the file.** `cargo horizon-mod build` (with `--wasm` for a WebAssembly mod) writes `target/horizon-mod/<id>.hmod`. That file is what you submit.
3. **Check it.** `cargo horizon-mod check target/horizon-mod/<id>.hmod` must pass ([Test a mod](/docs/test-a-mod#check-it-as-the-registry-does)).
4. **Publish the source.** Put the mod's source in a public repository, under a licence that lets players use it (MIT, Apache-2.0, GPL and so on, as an [SPDX](https://spdx.org/licenses/) name). Reviewers read it, and the file must be made from it.

## Sign it

Signing is optional and recommended. When your project has a public key, every later version must be signed with the matching secret key, so nobody else can publish an update in your name.

Horizon uses [minisign](https://jedisct1.github.io/minisign/) signatures. Install minisign (`brew install minisign`, `scoop install minisign`, or your Linux distribution's package), then make a key pair once:

```sh
minisign -G -p horizon-mods.pub -s horizon-mods.key
```

Keep `horizon-mods.key` and its password private and backed up: losing it means changing the project's key by hand, through the registry's maintainers. The public key is the last line of `horizon-mods.pub` (it starts with `RW`).

Sign each file you publish, and check the signature as the registry will:

```sh
minisign -S -s horizon-mods.key -m target/horizon-mod/greeter.hmod
cargo horizon-mod check target/horizon-mod/greeter.hmod --key "RW…your public key…" --signature target/horizon-mod/greeter.hmod.minisig
```

## Submit it

Publish with a pull request on horizon-mods: attach the file to a release of your own repository, then open a pull request that adds or updates `mods/<id>.toml` with the version, the file's name and its SHA-256, and put the file's download link (`https://github.com/<you>/<repo>/releases/download/<tag>/<file>`) in the pull request's description. The horizon-mods README says how, step by step: [Submit](https://github.com/horizon-rust/horizon-mods#submit). The upload form at [playhorizon.dev/mods/submit](/mods/submit) can't take `.hmod` mods or newer shader packs yet.

The registry fetches the linked file, checks its name and SHA-256 and runs the checker on it, then stages it for the checks, with no maintainer needed. A file linked anywhere else, or more than three in one pull request, is staged by a maintainer instead ([Staging by hand](https://github.com/horizon-rust/horizon-mods#staging-by-hand)). Then the repository's checks run `cargo horizon-mod check` on the file and post their report on the pull request.

## Review and publication

A reviewer reads the pull request, your source and the checks' report. A native mod runs with the player's rights, so its source also gets a security review; its description should say what it does and what it doesn't. Questions and requests for changes come as comments on the pull request: answer them there.

When the pull request is merged, the file becomes a release of horizon-mods within minutes, and the project gets its page at `playhorizon.dev/mods/<id>` and shows in the launcher. The [mod policy](/mods/policy) says what the registry takes.

## Updates

An update is a new version in your project's entry, made the same way. Only the entry's owners can add versions, and every version of a native mod is reviewed again. If the project has a key, the new file must be signed with it. The registry's file formats are in [the mod index reference](/docs/api/mod-index).

## Old .hnmod mods

Launchers from 0.2.70 on don't load native mods in the old `.hnmod` format (`horizon-mixin.toml`, `compatibility.json`). Make the mod again as a `.hmod` ([Make a mod](/docs/make-a-mod)) and publish it as a new version.

## Shader packs

A shader pack is made with `horizon-shader` ([the shader API](/docs/api/shaders)). Packs for shader API 0.1 no longer load: move a pack to API 0.2.

## Reports and takedowns

Anyone can report a project from its page. A project that does harm is taken down: the launcher then refuses its files and turns installed copies off, telling players why.
