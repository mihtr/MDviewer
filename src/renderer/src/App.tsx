import { useState, useEffect, useCallback } from 'react'
import { Toolbar } from './components/Toolbar'
import { Sidebar } from './components/Sidebar'
import { MarkdownViewer } from './components/MarkdownViewer'
import { TableOfContents } from './components/TableOfContents'
import type { FileNode, Heading } from './types'

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

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Listen for external file changes
  useEffect(() => {
    if (!openFile) return
    const unlisten = window.api.onFileChanged((data) => {
      setOpenFile({ path: data.path, content: data.content })
    })
    return unlisten
  }, [openFile?.path])

  const handleOpenFile = useCallback(async () => {
    const result = await window.api.openFile()
    if (!result) return
    setOpenFile(result)
    await window.api.watchFile(result.path)
    // If no directory open, show sidebar with parent dir
    if (!currentDirectory) {
      const parentDir = result.path.replace(/[\\/][^\\/]+$/, '')
      await loadDirectory(parentDir)
    }
  }, [currentDirectory])

  const handleOpenDirectory = useCallback(async () => {
    const dirPath = await window.api.openDirectory()
    if (!dirPath) return
    setSidebarOpen(true)
    await loadDirectory(dirPath)
  }, [])

  const loadDirectory = useCallback(async (dirPath: string) => {
    setCurrentDirectory(dirPath)
    const entries = await window.api.readDirectory(dirPath)
    setFileTree(entries)
    await window.api.watchDirectory(dirPath)
  }, [])

  // Refresh sidebar when files change on disk
  useEffect(() => {
    if (!currentDirectory) return
    const unlisten = window.api.onDirChanged(async () => {
      const entries = await window.api.readDirectory(currentDirectory)
      setFileTree(entries)
    })
    return unlisten
  }, [currentDirectory])

  const handleFileSelect = useCallback(async (node: FileNode) => {
    if (node.isDirectory) {
      await loadDirectory(node.path)
      return
    }
    const result = await window.api.readFile(node.path)
    if (result.content !== null) {
      setOpenFile({ path: node.path, content: result.content })
      await window.api.watchFile(node.path)
    }
  }, [loadDirectory])

  const handleNavigateUp = useCallback(async () => {
    if (!currentDirectory) return
    const parent = currentDirectory.replace(/[\\/][^\\/]+$/, '')
    if (parent && parent !== currentDirectory) {
      await loadDirectory(parent)
    }
  }, [currentDirectory, loadDirectory])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const filePath = (file as File & { path: string }).path
    if (!filePath) return
    const result = await window.api.readFile(filePath)
    if (result.content !== null) {
      setOpenFile({ path: filePath, content: result.content })
      await window.api.watchFile(filePath)
      if (!currentDirectory) {
        const parentDir = filePath.replace(/[\\/][^\\/]+$/, '')
        await loadDirectory(parentDir)
      }
    }
  }, [currentDirectory, loadDirectory])

  const basePath = openFile ? openFile.path.replace(/[\\/][^\\/]+$/, '') : null

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
          {openFile ? (
            <MarkdownViewer
              content={openFile.content}
              basePath={basePath}
              onHeadingsExtracted={setHeadings}
            />
          ) : (
            <Welcome onOpenFile={handleOpenFile} onOpenDirectory={handleOpenDirectory} />
          )}
        </main>

        {tocOpen && headings.length > 0 && (
          <TableOfContents headings={headings} />
        )}
      </div>
    </div>
  )
}

function Welcome({ onOpenFile, onOpenDirectory }: {
  onOpenFile: () => void
  onOpenDirectory: () => void
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
        <p className="welcome-hint">You can also drag and drop a .md file onto this window</p>
      </div>
    </div>
  )
}
