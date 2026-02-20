# MDviewer — TODO & Improvement Suggestions

## v1.0.1 — 2026-02-20
### fix: bug fixes, tests, and sidebar/image improvements
- Fix sidebar nested entries never showing active highlight
- Fix relative images not rendering (resolve to file:// URL)
- Implement drag-and-drop to open .md files
- Add live sidebar refresh via fs.watch on current directory
- Add unit, component, and e2e test suite (57 + 7 tests)

## Bugs

- [x] **Sidebar active highlight** — nested entries compared `child.path === node.path` instead of `currentFilePath`
- [x] **Images don't render** — relative image paths fail; base URL must be resolved to `file://`
- [x] **Drag-and-drop not implemented** — Welcome screen mentions it but no handler existed
- [x] **Sidebar doesn't refresh** — adding/deleting files on disk required manual navigation to refresh

## High-Value Features

- [x] **Recent files** — persist a short list of recently opened files/folders between sessions (`localStorage` or `app.getPath('userData')`)
- [x] **Find in file** — `Ctrl+F` to search within the rendered document with match highlighting and scroll
- [x] **Scroll position memory** — remember scroll position per file path; restore when switching back
- [x] **Keyboard shortcuts** — `Ctrl+O` open file, `Ctrl+Shift+O` open folder, `Ctrl+\` toggle sidebar, `Ctrl+Shift+T` toggle TOC

## Rendering Enhancements

- [ ] **Mermaid diagrams** — render ` ```mermaid ` blocks as flowcharts/sequence diagrams
- [ ] **Math / LaTeX** — `remark-math` + `rehype-katex` for `$...$` and `$$...$$` expressions
- [ ] **YAML frontmatter** — strip (or optionally display) `---` frontmatter blocks via `remark-frontmatter`

## Polish

- [x] **Print / export to PDF** — `webContents.printToPDF()` via IPC
- [x] **Zoom controls** — `Ctrl++` / `Ctrl+-` to adjust font size
- [x] **Window title** — update to show the open filename instead of always "MDviewer"
- [x] **Empty sidebar message** — distinguish "folder is empty" from "folder has no markdown files"

## Known Limitations

- Expanded subdirectory entries in the sidebar don't auto-refresh (only the root-level directory is watched)
- Only one file is watched for external changes at a time
