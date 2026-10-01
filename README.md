# dsh-file-archive

> A sidebar file manager for **DeepSeek Harness** — browse, preview, move and
> recycle-bin delete the files your agent produces, without leaving the app.

[中文说明 →](./README.zh.md)

![File Archive panel](./docs/screenshot.png)

---

## What it does

DeepSeek Harness agents write files into your workspaces: reports, spreadsheets,
images, code, archives. `dsh-file-archive` adds a **file manager panel** to the
sidebar so you can look at what was produced, preview it, reorganize it, and
clean it up — safely.

## Features

**Browse & find**
- One panel covering **every registered workspace**, with an expandable directory tree
- Filename search **and** full-text content search (bounded, skips binaries / `node_modules` / hidden dirs)
- Breadcrumb navigation, sortable list, list / grid views

**Preview (all types)**
- Text & code (lightweight syntax highlighting), Markdown (rendered), images, PDF, and Office documents (converted to PDF)

**Move & copy**
- Move or copy to any folder — **including across drives**
- Same-volume move is an instant rename; cross-volume uses copy-then-delete with byte-level progress and a cancel button
- Free-space pre-check before copying, and a conflict policy (auto-rename / overwrite / skip)
- Drag & drop onto a folder, or use the buttons / right-click menu

**Delete, safely**
- Deletes go to the **Windows Recycle Bin** — never a permanent unlink
- A deletion log records what was removed and where it came from

**Archive**
- Compress selected files/folders to `.zip`, and extract `.zip` — through a
  **zero-dependency** built-in ZIP implementation

**Look & feel**
- Frosted-glass popups, large rounded corners, minimal line-art icons
- Follows the DSH theme (light / dark) automatically
- English & Chinese UI

## Install

```bash
dsh plugin add github:baisedoubi111/dsh-file-archive
```

Pin a specific release:

```bash
dsh plugin add github:baisedoubi111/dsh-file-archive#v0.1.0
```

Then restart DeepSeek Harness and look for the **File Archive** icon in the
sidebar.

> This plugin is distributed from this repository. It is not published to npm
> yet, so use the `github:` form above.

## Platform support

| Capability | Windows | macOS | Linux |
|---|---|---|---|
| Browse / preview / search / move / copy / zip | ✅ | ✅ | ✅ |
| Delete to system Recycle Bin | ✅ | — | — |
| "Show in folder" / "Open Recycle Bin" | ✅ | — | — |

The plugin is **Windows-first**: recycle-bin deletion and Explorer integration
use Windows APIs. Everything else is plain Node and works anywhere. macOS/Linux
trash support is a welcome contribution.

## Safety model

This plugin can delete files, so it is deliberately conservative — enforced in
code (`guards.js`), not by convention:

- **Allowlist** — it only ever touches files inside a *registered workspace*.
- **Denylist** — it never touches the DSH data directory, its own package
  directory, system directories (`C:\Windows`, `Program Files`, …), or `.git` /
  `.dsh` segments.
- **Recycle Bin only** — there is no permanent-delete path and no "empty
  recycle bin" button.
- **Path validation** — every path is resolved with `realpath` and checked for
  containment; ZIP extraction is guarded against zip-slip.
- **Batch limits** — file-count and total-size caps per operation.
- **Zero runtime dependencies** — the host half imports only Node built-ins and
  local modules, so it can never fail to resolve a package at boot.

See [SAFETY.md](./SAFETY.md) for the full contract.

## How it is built

A standard DSH dual-half plugin:

- **Host half** (`index.js`, `guards.js`, `zip.js`) — a Cordis bundle plugin that
  mounts a private HTTP API under `/dsh-file-archive/*`.
- **Client half** (`client.js`) — a `window.__ModuleLoader__` bundle that
  registers a `sidebar.panellist` icon, a `main` panel, and `shell.overlay` modals.

## Development

The plugin is installed with `link:` during development, so editing the source
takes effect on the next restart (the host half) and page reload (the client half).

```
index.js     host entry: HTTP routes + engines
guards.js    allowlist / denylist / limits
zip.js       zero-dependency ZIP reader/writer
client.js    the whole UI (React.createElement, no build step)
```

## License

[MIT](./LICENSE)
