import { useState } from 'react'
import type { FileNode } from '../types'
import { isMarkdown } from '../utils'

interface SidebarProps {
  fileTree: FileNode[]
  currentDirectory: string | null
  currentFilePath: string | null
  onFileSelect: (node: FileNode) => void
  onNavigateUp: () => void
}

export function Sidebar({
  fileTree,
  currentDirectory,
  currentFilePath,
  onFileSelect,
  onNavigateUp
}: SidebarProps): JSX.Element {
  const dirName = currentDirectory
    ? currentDirectory.split(/[\\/]/).pop() ?? currentDirectory
    : 'Files'

  // Sort: directories first, then by name
  const sorted = [...fileTree].sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="sidebar-up-btn" onClick={onNavigateUp} title="Go up one level">
          <IconUp />
        </button>
        <span className="sidebar-dir-name" title={currentDirectory ?? ''}>
          {dirName}
        </span>
      </div>
      <div className="sidebar-list">
        {fileTree.length === 0 && (
          <p className="sidebar-empty">This folder is empty</p>
        )}
        {fileTree.length > 0 && !fileTree.some(n => n.isDirectory || isMarkdown(n.name)) && (
          <p className="sidebar-empty" style={{ marginBottom: 4 }}>No Markdown files here</p>
        )}
        {sorted.map((node) => (
          <SidebarEntry
            key={node.path}
            node={node}
            isActive={node.path === currentFilePath}
            currentFilePath={currentFilePath}
            onSelect={onFileSelect}
          />
        ))}
      </div>
    </aside>
  )
}

function SidebarEntry({
  node,
  isActive,
  currentFilePath,
  onSelect
}: {
  node: FileNode
  isActive: boolean
  currentFilePath: string | null
  onSelect: (node: FileNode) => void
}): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<FileNode[]>([])

  const handleClick = async (): Promise<void> => {
    if (node.isDirectory) {
      if (!expanded) {
        const entries = await window.api.readDirectory(node.path)
        setChildren(entries)
      }
      setExpanded((e) => !e)
    } else {
      onSelect(node)
    }
  }

  const isMd = !node.isDirectory && isMarkdown(node.name)
  const isDimmed = !node.isDirectory && !isMd

  return (
    <div className="sidebar-entry-group">
      <button
        className={`sidebar-entry ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
        onClick={handleClick}
        title={node.path}
      >
        <span className="sidebar-entry-icon">
          {node.isDirectory ? (expanded ? <IconFolderOpen /> : <IconFolder />) : <IconFile />}
        </span>
        <span className="sidebar-entry-name">{node.name}</span>
        {node.isDirectory && (
          <span className="sidebar-entry-chevron">
            <IconChevron expanded={expanded} />
          </span>
        )}
      </button>
      {node.isDirectory && expanded && children.length > 0 && (
        <div className="sidebar-children">
          {[...children]
            .sort((a, b) => {
              if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
              return a.name.localeCompare(b.name)
            })
            .map((child) => (
              <SidebarEntry
                key={child.path}
                node={child}
                isActive={child.path === currentFilePath}
                currentFilePath={currentFilePath}
                onSelect={onSelect}
              />
            ))}
        </div>
      )}
    </div>
  )
}

function IconUp(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconFolder(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2H5l1.5 2H11.5A1.5 1.5 0 0 1 13 5.5v5A1.5 1.5 0 0 1 11.5 12h-9A1.5 1.5 0 0 1 1 10.5v-7z"
        stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  )
}

function IconFolderOpen(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2H5l1.5 2H11.5A1.5 1.5 0 0 1 13 5.5V6H1V3.5z"
        stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M1 6h12l-1.5 6h-9L1 6z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  )
}

function IconFile(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 1.5h5.5L11 4v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-11A.5.5 0 0 1 3 1.5z"
        stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8.5 1.5V4H11" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

function IconChevron({ expanded }: { expanded: boolean }): JSX.Element {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
    >
      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
