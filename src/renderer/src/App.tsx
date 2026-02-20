import { useState, useEffect, useCallback, useRef } from 'react'
import { Toolbar } from './components/Toolbar'
import { Sidebar } from './components/Sidebar'
import { MarkdownViewer } from './components/MarkdownViewer'
import { TableOfContents } from './components/TableOfContents'
import { FindBar } from './components/FindBar'
import type { FileNode, Heading, RecentEntry } from './types'
import { parentDir, getRecent, addRecent } from './utils'

interface OpenFile {
  path: string
  content: string
}

export default function App(): JSX.Element {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [openFile, setOpenFile] = useState<OpenFile | null>(null)
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(true)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [findOpen, setFindOpen] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const [recentFiles, setRecentFiles] = useState<RecentEntry[]>(getRecent)

  // Refs for scroll memory and stable keyboard handler callbacks
  const scrollPositions = useRef<Map<string, number>>(new Map())
  const openFileRef = useRef<OpenFile | null>(null)
  openFileRef.current = openFile
  const handleOpenFileRef = useRef<() => void>(() => {})
  const handleOpenDirectoryRef = useRef<() => void>(() => {})

  // ── Side effects ───────────────────────────────────────────

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--content-zoom', String(zoom))
  }, [zoom])

  useEffect(() => {
    document.title = openFile
      ? `${openFile.path.split(/[\\/]/).pop()} — MDviewer`
      : 'MDviewer'
  }, [openFile?.path])

  // Restore scroll position after file change
  useEffect(() => {
    if (!openFile) return
    const saved = scrollPositions.current.get(openFile.path) ?? 0
    const timer = setTimeout(() => {
      const el = document.querySelector<HTMLElement>('.markdown-scroll')
      if (el) el.scrollTop = saved
    }, 50)
    return () => clearTimeout(timer)
  }, [openFile?.path])

  useEffect(() => {
    if (!openFile) return
    const unlisten = window.api.onFileChanged((data) => {
      setOpenFile({ path: data.path, content: data.content })
    })
    return unlisten
  }, [openFile?.path])

  useEffect(() => {
    if (!currentDirectory) return
    const unlisten = window.api.onDirChanged(async () => {
      const entries = await window.api.readDirectory(currentDirectory)
      setFileTree(entries)
    })
    return unlisten
  }, [currentDirectory])

  // Keyboard shortcuts — uses refs so the listener is only added once
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl) {
        switch (e.key) {
          case 'o': if (!e.shiftKey) { e.preventDefault(); handleOpenFileRef.current() } break
          case 'O': if (e.shiftKey) { e.preventDefault(); handleOpenDirectoryRef.current() } break
          case '\\': e.preventDefault(); setSidebarOpen(o => !o); break
          case 'T': if (e.shiftKey) { e.preventDefault(); setTocOpen(o => !o) } break
          case 'f': e.preventDefault(); setFindOpen(true); break
          case '=': case '+': e.preventDefault(); setZoom(z => Math.min(2.0, +(z + 0.1).toFixed(1))); break
          case '-': e.preventDefault(); setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1))); break
          case '0': e.preventDefault(); setZoom(1.0); break
        }
      }
      if (e.key === 'Escape') setFindOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Helpers ────────────────────────────────────────────────

  const saveScrollPos = (): void => {
    if (openFileRef.current) {
      const el = document.querySelector<HTMLElement>('.markdown-scroll')
      if (el) scrollPositions.current.set(openFileRef.current.path, el.scrollTop)
    }
  }

  const refreshRecent = useCallback((): void => setRecentFiles(getRecent()), [])

  // ── Actions ────────────────────────────────────────────────

  const loadDirectory = useCallback(async (dirPath: string): Promise<void> => {
    setCurrentDirectory(dirPath)
    const entries = await window.api.readDirectory(dirPath)
    setFileTree(entries)
    await window.api.watchDirectory(dirPath)
  }, [])

  const handleOpenFile = useCallback(async (): Promise<void> => {
    saveScrollPos()
    const result = await window.api.openFile()
    if (!result) return
    setOpenFile(result)
    await window.api.watchFile(result.path)
    const name = result.path.split(/[\\/]/).pop() ?? result.path
    addRecent({ path: result.path, name, type: 'file' })
    refreshRecent()
    if (!currentDirectory) await loadDirectory(parentDir(result.path))
  }, [currentDirectory, loadDirectory, refreshRecent])

  useEffect(() => { handleOpenFileRef.current = handleOpenFile }, [handleOpenFile])

  const handleOpenDirectory = useCallback(async (): Promise<void> => {
    const dirPath = await window.api.openDirectory()
    if (!dirPath) return
    setSidebarOpen(true)
    await loadDirectory(dirPath)
    const name = dirPath.split(/[\\/]/).pop() ?? dirPath
    addRecent({ path: dirPath, name, type: 'directory' })
    refreshRecent()
  }, [loadDirectory, refreshRecent])

  useEffect(() => { handleOpenDirectoryRef.current = handleOpenDirectory }, [handleOpenDirectory])

  const handleFileSelect = useCallback(async (node: FileNode): Promise<void> => {
    if (node.isDirectory) { await loadDirectory(node.path); return }
    saveScrollPos()
    const result = await window.api.readFile(node.path)
    if (result.content !== null) {
      setOpenFile({ path: node.path, content: result.content })
      await window.api.watchFile(node.path)
      addRecent({ path: node.path, name: node.name, type: 'file' })
      refreshRecent()
    }
  }, [loadDirectory, refreshRecent])

  const handleNavigateUp = useCallback(async (): Promise<void> => {
    if (!currentDirectory) return
    const parent = parentDir(currentDirectory)
    if (parent && parent !== currentDirectory) await loadDirectory(parent)
  }, [currentDirectory, loadDirectory])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const filePath = (file as File & { path: string }).path
    if (!filePath) return
    saveScrollPos()
    const result = await window.api.readFile(filePath)
    if (result.content !== null) {
      setOpenFile({ path: filePath, content: result.content })
      await window.api.watchFile(filePath)
      const name = filePath.split(/[\\/]/).pop() ?? filePath
      addRecent({ path: filePath, name, type: 'file' })
      refreshRecent()
      if (!currentDirectory) await loadDirectory(parentDir(filePath))
    }
  }, [currentDirectory, loadDirectory, refreshRecent])

  const handleOpenFromRecent = useCallback(async (entry: RecentEntry): Promise<void> => {
    if (entry.type === 'directory') {
      setSidebarOpen(true)
      await loadDirectory(entry.path)
    } else {
      saveScrollPos()
      const result = await window.api.readFile(entry.path)
      if (result.content !== null) {
        setOpenFile({ path: entry.path, content: result.content })
        await window.api.watchFile(entry.path)
        if (!currentDirectory) await loadDirectory(parentDir(entry.path))
      }
    }
    addRecent({ path: entry.path, name: entry.name, type: entry.type })
    refreshRecent()
  }, [currentDirectory, loadDirectory, refreshRecent])

  const basePath = openFile ? parentDir(openFile.path) : null

  return (
    <div
      className="app-shell"
      data-sidebar={sidebarOpen}
      data-toc={tocOpen}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Toolbar
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onOpenFile={handleOpenFile}
        onOpenDirectory={handleOpenDirectory}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        tocOpen={tocOpen}
        onToggleToc={() => setTocOpen(o => !o)}
        fileName={openFile ? openFile.path.split(/[\\/]/).pop() ?? null : null}
        findOpen={findOpen}
        onToggleFind={() => setFindOpen(o => !o)}
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(2.0, +(z + 0.1).toFixed(1)))}
        onZoomOut={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)))}
        onZoomReset={() => setZoom(1.0)}
        onPrintToPDF={() => window.api.printToPDF()}
      />

      <div className="app-body">
        {sidebarOpen && (
          <Sidebar
            fileTree={fileTree}
            currentDirectory={currentDirectory}
            currentFilePath={openFile?.path ?? null}
            onFileSelect={handleFileSelect}
            onNavigateUp={handleNavigateUp}
          />
        )}

        <main className="content-area">
          {findOpen && <FindBar onClose={() => setFindOpen(false)} />}
          {openFile ? (
            <MarkdownViewer
              content={openFile.content}
              basePath={basePath}
              onHeadingsExtracted={setHeadings}
            />
          ) : (
            <Welcome
              onOpenFile={handleOpenFile}
              onOpenDirectory={handleOpenDirectory}
              recentFiles={recentFiles}
              onOpenFromRecent={handleOpenFromRecent}
            />
          )}
        </main>

        {tocOpen && headings.length > 0 && (
          <TableOfContents headings={headings} />
        )}
      </div>
    </div>
  )
}

function Welcome({ onOpenFile, onOpenDirectory, recentFiles, onOpenFromRecent }: {
  onOpenFile: () => void
  onOpenDirectory: () => void
  recentFiles: RecentEntry[]
  onOpenFromRecent: (entry: RecentEntry) => void
}): JSX.Element {
  return (
    <div className="welcome">
      <div className="welcome-inner">
        <svg className="welcome-logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="56" height="48" rx="6" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M14 24v16M14 24l8 8 8-8M38 24v16M46 40V24l-8 10-8-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1>MDviewer</h1>
        <p>Open a Markdown file or folder to get started</p>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={onOpenFile}>Open File</button>
          <button className="btn btn-secondary" onClick={onOpenDirectory}>Open Folder</button>
        </div>
        <p className="welcome-hint">Drag and drop a .md file · Ctrl+O to open</p>
        {recentFiles.length > 0 && (
          <div className="recent-list">
            <p className="recent-heading">Recent</p>
            {recentFiles.map(entry => (
              <button
                key={entry.path}
                className="recent-item"
                onClick={() => onOpenFromRecent(entry)}
                title={entry.path}
              >
                {entry.type === 'directory' ? <IconFolder /> : <IconFile />}
                <span className="recent-item-name">{entry.name}</span>
                <span className="recent-item-path">{entry.path}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function IconFolder(): JSX.Element {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: 'var(--text-dim)' }}>
      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2H5l1.5 2H11.5A1.5 1.5 0 0 1 13 5.5v5A1.5 1.5 0 0 1 11.5 12h-9A1.5 1.5 0 0 1 1 10.5v-7z"
        stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  )
}

function IconFile(): JSX.Element {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: 'var(--text-dim)' }}>
      <path d="M3 1.5h5.5L11 4v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-11A.5.5 0 0 1 3 1.5z"
        stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8.5 1.5V4H11" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}
