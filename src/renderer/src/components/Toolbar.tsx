interface ToolbarProps {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onOpenFile: () => void
  onOpenDirectory: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
  tocOpen: boolean
  onToggleToc: () => void
  fileName: string | null
}

export function Toolbar({
  theme,
  onToggleTheme,
  onOpenFile,
  onOpenDirectory,
  sidebarOpen,
  onToggleSidebar,
  tocOpen,
  onToggleToc,
  fileName
}: ToolbarProps): JSX.Element {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <button
          className={`icon-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title="Toggle file browser"
          aria-label="Toggle sidebar"
        >
          <IconSidebar />
        </button>
        <span className="toolbar-brand">MDviewer</span>
      </div>

      <div className="toolbar-center">
        {fileName && <span className="toolbar-filename">{fileName}</span>}
      </div>

      <div className="toolbar-right">
        <button className="btn btn-sm" onClick={onOpenFile} title="Open Markdown file">
          Open File
        </button>
        <button className="btn btn-sm btn-ghost" onClick={onOpenDirectory} title="Open folder">
          Open Folder
        </button>
        <div className="toolbar-divider" />
        <button
          className={`icon-btn ${tocOpen ? 'active' : ''}`}
          onClick={onToggleToc}
          title="Toggle table of contents"
          aria-label="Toggle TOC"
        >
          <IconToc />
        </button>
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
      </div>
    </header>
  )
}

function IconSidebar(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="15" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 1.5v15" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function IconToc(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 4h14M2 9h10M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconSun(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.41 1.41M13.37 13.37l1.41 1.41M3.22 14.78l1.41-1.41M13.37 4.63l1.41-1.41"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconMoon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15.5 10.5A6.5 6.5 0 0 1 7.5 2.5a6.5 6.5 0 1 0 8 8z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
