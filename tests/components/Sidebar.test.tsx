import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../../src/renderer/src/components/Sidebar'
import type { FileNode } from '../../src/renderer/src/types'

const makeNode = (overrides: Partial<FileNode> = {}): FileNode => ({
  name: 'README.md',
  path: '/docs/README.md',
  isDirectory: false,
  size: 1024,
  modified: Date.now(),
  ...overrides
})

const defaultProps = {
  fileTree: [],
  currentDirectory: '/docs',
  currentFilePath: null,
  onFileSelect: vi.fn(),
  onNavigateUp: vi.fn()
}

describe('Sidebar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the current directory name', () => {
    render(<Sidebar {...defaultProps} currentDirectory="/home/user/docs" />)
    expect(screen.getByText('docs')).toBeInTheDocument()
  })

  it('shows "No files found" when the tree is empty', () => {
    render(<Sidebar {...defaultProps} fileTree={[]} />)
    expect(screen.getByText('No files found')).toBeInTheDocument()
  })

  it('renders file entries', () => {
    const files = [makeNode({ name: 'README.md' }), makeNode({ name: 'CHANGELOG.md', path: '/docs/CHANGELOG.md' })]
    render(<Sidebar {...defaultProps} fileTree={files} />)
    expect(screen.getByText('README.md')).toBeInTheDocument()
    expect(screen.getByText('CHANGELOG.md')).toBeInTheDocument()
  })

  it('calls onFileSelect when a file is clicked', async () => {
    const onFileSelect = vi.fn()
    const file = makeNode()
    render(<Sidebar {...defaultProps} fileTree={[file]} onFileSelect={onFileSelect} />)
    await userEvent.click(screen.getByText('README.md'))
    expect(onFileSelect).toHaveBeenCalledWith(file)
  })

  it('marks the active file with the active class', () => {
    const file = makeNode({ path: '/docs/README.md' })
    render(<Sidebar {...defaultProps} fileTree={[file]} currentFilePath="/docs/README.md" />)
    expect(screen.getByTitle('/docs/README.md')).toHaveClass('active')
  })

  it('does not mark inactive files with the active class', () => {
    const file = makeNode({ path: '/docs/README.md' })
    render(<Sidebar {...defaultProps} fileTree={[file]} currentFilePath="/docs/OTHER.md" />)
    expect(screen.getByTitle('/docs/README.md')).not.toHaveClass('active')
  })

  it('calls onNavigateUp when the up button is clicked', async () => {
    const onNavigateUp = vi.fn()
    render(<Sidebar {...defaultProps} onNavigateUp={onNavigateUp} />)
    await userEvent.click(screen.getByTitle('Go up one level'))
    expect(onNavigateUp).toHaveBeenCalledOnce()
  })

  it('sorts directories before files', () => {
    const nodes = [
      makeNode({ name: 'zebra.md', path: '/docs/zebra.md' }),
      makeNode({ name: 'assets', path: '/docs/assets', isDirectory: true }),
      makeNode({ name: 'alpha.md', path: '/docs/alpha.md' })
    ]
    render(<Sidebar {...defaultProps} fileTree={nodes} />)
    const entries = screen.getAllByRole('button', { name: /assets|zebra|alpha/i })
    expect(entries[0]).toHaveTextContent('assets')
    expect(entries[1]).toHaveTextContent('alpha.md')
    expect(entries[2]).toHaveTextContent('zebra.md')
  })

  it('expands a directory and loads its children on click', async () => {
    vi.mocked(window.api.readDirectory).mockResolvedValue([
      makeNode({ name: 'child.md', path: '/docs/assets/child.md' })
    ])
    const dir = makeNode({ name: 'assets', path: '/docs/assets', isDirectory: true })
    render(<Sidebar {...defaultProps} fileTree={[dir]} />)
    await userEvent.click(screen.getByText('assets'))
    expect(window.api.readDirectory).toHaveBeenCalledWith('/docs/assets')
    expect(await screen.findByText('child.md')).toBeInTheDocument()
  })
})
