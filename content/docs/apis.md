# APIs at a glance

Horizon is built to be built on. Mods, shaders, agents, server panels, launchers' scripts and tools all get a documented API with a version, a stability level and a reference generated from the code, so it never says something the game doesn't do.

## What you can build on

| Surface | For | Today | Stability |
| --- | --- | --- | --- |
| **Mods** | mod authors | One `.hmod` package with a `horizon-mod.toml` manifest (`api = "0.2"`). Content mods: data-driven blocks, items, recipes and structures. Code mods: Rust on the `mod_api` crate's hooks, either native (compiled by the launcher against the prebuilt game) or WebAssembly (run in the game's sandbox) | experimental |
| **Shaders** | shader authors | shader API 0.2: WGSL packs on stages of Horizon's renderer, with typed inputs and options. Packs for 0.1 no longer load | experimental |
| **Agent control** | AI agents, scripts, tests | `horizon-ctl` and its MCP server: 96 commands to watch and play the game | preview |
| **Servers** | hosts, panels, bots | `horizon-server`'s commands, `server.toml` and a local HTTP control API | stable |
| **Launcher** | your agent, pack makers | `horizon-launcher`'s 46 commands and its MCP server | preview |
| **Data formats** | tools that read Horizon's files | benchmark reports, telemetry, settings, release checksums; worlds are vanilla's format | per format |

The full pages, one per surface, with their references: [the API portal](/docs/api). Mods: [make a mod](/docs/make-a-mod), [mod code](/docs/mod-code), [content mods](/docs/content-mods) and [the modding book](https://github.com/horizon-rust/horizon/blob/main/docs/modding/src/introduction.md). Mods for players: [Mods](/docs/mods). Agents: [Control Horizon with your AI agent](/docs/agents). Hosting: [Host a server](/docs/hosting).

## What the levels mean

- **Stable**: only additions within a major version. A change that would break you comes as a new major, served beside the old one for at least 180 days.
- **Preview**: documented and tested. It may change at a new line (0.1 to 0.2), after a deprecation of at least 30 days during which old and new both work.
- **Experimental**: opt-in only, and it may change in any release.

Every API has its own version (mods declare `api = "0.2"`, the server's control API is `/api/v1`), separate from the game's release number. The whole policy: [stability and versioning](https://github.com/horizon-rust/horizon/blob/main/docs/api/stability.md).

## How they are designed

Each API starts from what its users need to do, and from how Horizon is built: Rust, wgpu and a server thread that runs every world. Horizon's APIs are its own: they are not modelled on another mod loader's, renderer's or server platform's. Vanilla Minecraft 26.3 is the reference for game concepts such as ids, commands and data packs.

They are safe by default (content mods are data only, WebAssembly mods run in a sandbox, native mods build only after a warning; control sockets only listen on your computer, behind a token) and cost nothing when unused.

## References that can't drift

Each reference is written by code from the source it describes, and a test fails when the two differ: `horizon-ctl` and the launcher from their command tables, the server from its settings template and route table. A change to an API changes its reference in the same pull request.
