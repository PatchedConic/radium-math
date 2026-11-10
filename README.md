# Radium Math

A desktop app for writing engineering calculation documents: formatted text, captioned images, and live natural-notation math with units, evaluated top to bottom and exported to PDF.

Status: early development (milestone M0, foundation). Nothing is usable yet.

## Build from source

Prerequisites: Node 22, pnpm (version pinned in `package.json`), Rust stable via rustup, and the Tauri 2 system packages listed in [CLAUDE.md](CLAUDE.md#commands) under "Local setup".

```sh
pnpm install
pnpm tauri dev    # run the app
pnpm check        # every quality gate
```

## Docs

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Milestone plan](docs/plan.md)
- [Decision records](docs/adr/)

## License

[MIT](LICENSE)
