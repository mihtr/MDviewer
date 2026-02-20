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
  findOpen: boolean
  onToggleFind: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onPrintToPDF: () => void
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
  fileName,
  findOpen,
  onToggleFind,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onPrintToPDF
}: ToolbarProps): JSX.Element {
  const zoomLabel = zoom === 1.0 ? '100%' : `${Math.round(zoom * 100)}%`

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <button
          className={`icon-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title="Toggle file browser (Ctrl+\)"
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
        <button className="btn btn-sm" onClick={onOpenFile} title="Open Markdown file (Ctrl+O)">
          Open File
        </button>
        <button className="btn btn-sm btn-ghost" onClick={onOpenDirectory} title="Open folder (Ctrl+Shift+O)">
          Open Folder
        </button>
        <div className="toolbar-divider" />
        <button
          className={`icon-btn ${findOpen ? 'active' : ''}`}
          onClick={onToggleFind}
          title="Find in page (Ctrl+F)"
          aria-label="Find in page"
        >
          <IconSearch />
        </button>
        {fileName && (
          <button
            className="icon-btn"
            onClick={onPrintToPDF}
            title="Export to PDF"
            aria-label="Export to PDF"
          >
            <IconPrint />
          </button>
        )}
        <div className="toolbar-divider" />
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={onZoomOut} title="Zoom out (Ctrl+-)">−</button>
          <button className="zoom-label" onClick={onZoomReset} title="Reset zoom (Ctrl+0)">{zoomLabel}</button>
          <button className="zoom-btn" onClick={onZoomIn} title="Zoom in (Ctrl+=)">+</button>
        </div>
        <div className="toolbar-divider" />
        <button
          className={`icon-btn ${tocOpen ? 'active' : ''}`}
          onClick={onToggleToc}
          title="Toggle table of contents (Ctrl+Shift+T)"
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

function IconSearch(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IconPrint(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 5V2h8v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="1" y="5" width="14" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 9h8M4 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M4 9v5h8V9" stroke="currentColor" strokeWidth="1.3"/>
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
