# MDviewer

A lightweight desktop Markdown viewer built with Electron, React, and TypeScript.

![Dark mode screenshot placeholder](resources/screenshot.png)

## Features

- **Open files or folders** via native dialogs or the welcome screen
- **File tree sidebar** — recursive directory browser with lazy-loaded subdirectories
- **Markdown rendering** — GitHub Flavored Markdown, tables, task lists, strikethrough
- **Syntax highlighting** — code blocks highlighted via highlight.js
- **Table of Contents** — auto-generated from headings, smooth-scroll navigation
- **Live reload** — file is re-rendered automatically when changed on disk
- **Copy buttons** on all code blocks
- **Dark / light theme** toggle
- Links open in the system browser

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install & run

```bash
npm install
npm run dev
```

### Build

```bash
npm run build        # compile to out/
npm run package      # build + package installer to dist/
```

### Type check

```bash
npm run typecheck
```

## Project Structure

```
src/
├── main/
│   └── index.ts          # Electron main process — file I/O, IPC handlers, file watching
├── preload/
│   └── index.ts          # contextBridge — exposes window.api to the renderer
└── renderer/src/
    ├── App.tsx            # Root component — owns all app state
    ├── types.ts           # Shared TypeScript types
    └── components/
        ├── Toolbar.tsx        # Top bar: open, theme toggle, sidebar/TOC toggles
        ├── Sidebar.tsx        # File tree browser
        ├── MarkdownViewer.tsx # react-markdown renderer with copy buttons
        └── TableOfContents.tsx
```

## Tech Stack

| | |
|---|---|
| Framework | [Electron](https://www.electronjs.org/) 29 |
| Build tool | [electron-vite](https://electron-vite.org/) 2 |
| UI | [React](https://react.dev/) 18 + TypeScript |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm + remark-breaks |
| Highlighting | [rehype-highlight](https://github.com/rehypejs/rehype-highlight) (highlight.js) |
| Anchors | [rehype-slug](https://github.com/rehypejs/rehype-slug) |

## License

MIT
