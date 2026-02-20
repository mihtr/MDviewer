# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Electron in dev mode (hot-reload for renderer)
npm run build      # Production build (outputs to out/)
npm run package    # Build + package into a distributable (outputs to dist/)
npm run typecheck  # TypeScript type-check without emitting
```

## Architecture

This is an **Electron desktop app** built with `electron-vite` (Vite-based build tool for Electron). There are three separate compilation targets managed by `electron.vite.config.ts`:

| Target | Entry | Output | Env |
|--------|-------|--------|-----|
| Main process | `src/main/index.ts` | `out/main/index.js` | Node.js |
| Preload script | `src/preload/index.ts` | `out/preload/index.js` | Isolated world |
| Renderer | `src/renderer/src/main.tsx` | `out/renderer/` | Browser |

### IPC Pattern

The app follows Electron's recommended security model:

- **Main process** (`src/main/index.ts`) — All file system access, native dialogs (`dialog.showOpenDialog`), file watching (`fs.watchFile`). Exposes IPC handlers via `ipcMain.handle(channel, handler)`.
- **Preload** (`src/preload/index.ts`) — Bridges main ↔ renderer via `contextBridge.exposeInMainWorld('api', ...)`. Exposes the `window.api` object typed as `ElectronAPI`.
- **Renderer** (`src/renderer/src/`) — React app. Never accesses Node.js or Electron APIs directly; always goes through `window.api`.

IPC channels: `dialog:openFile`, `dialog:openDirectory`, `fs:readFile`, `fs:readDirectory`, `fs:watchFile`, `fs:unwatchFile`. The main process pushes file-change events to the renderer via `webContents.send('fs:fileChanged', ...)`.

### Renderer Structure

```
src/renderer/src/
├── App.tsx              # Root: owns all state (open file, directory, theme, headings)
├── types.ts             # Shared TypeScript types (FileNode, FileResult, Heading)
├── main.tsx             # ReactDOM.createRoot entry
├── components/
│   ├── Toolbar.tsx      # Top bar: open file/folder, theme toggle, TOC/sidebar toggles
│   ├── Sidebar.tsx      # Recursive file tree browser; lazily loads subdirectory contents
│   ├── MarkdownViewer.tsx   # react-markdown renderer with code copy buttons
│   └── TableOfContents.tsx  # Auto-generated from h1–h6 headings after render
└── styles/
    ├── global.css       # CSS variables (dark/light themes), layout, UI components
    └── markdown.css     # Typography and code highlighting for rendered markdown
```

### Theming

Themes are implemented with CSS custom properties on `document.documentElement[data-theme]`. Dark is the default. All colours reference `var(--...)` variables defined in `global.css`.

### TypeScript Configs

- `tsconfig.json` — References-only root; delegates to the two below
- `tsconfig.node.json` — Main + preload (targets ES2022, Node types)
- `tsconfig.web.json` — Renderer (targets ES2020, DOM types, JSX)

### Shared Types

Types shared between the renderer components live in `src/renderer/src/types.ts`. Do **not** import directly from `src/preload/index.ts` in renderer code — the renderer's Vite build cannot resolve across compilation targets. Instead, add shared types to `types.ts`.

## Dependencies

Key runtime libraries:
- `react-markdown` + `remark-gfm` + `remark-breaks` — Markdown rendering with GitHub Flavored Markdown
- `rehype-highlight` — Syntax highlighting via highlight.js
- `rehype-slug` — Auto-generates `id` attributes on headings (required for TOC anchor links)
