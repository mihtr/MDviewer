import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toolbar } from '../../src/renderer/src/components/Toolbar'

const defaultProps = {
  theme: 'dark' as const,
  onToggleTheme: vi.fn(),
  onOpenFile: vi.fn(),
  onOpenDirectory: vi.fn(),
  sidebarOpen: false,
  onToggleSidebar: vi.fn(),
  tocOpen: true,
  onToggleToc: vi.fn(),
  fileName: null
}

describe('Toolbar', () => {
  it('renders the brand name', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByText('MDviewer')).toBeInTheDocument()
  })

  it('renders Open File and Open Folder buttons', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByText('Open File')).toBeInTheDocument()
    expect(screen.getByText('Open Folder')).toBeInTheDocument()
  })

  it('calls onOpenFile when Open File is clicked', async () => {
    const onOpenFile = vi.fn()
    render(<Toolbar {...defaultProps} onOpenFile={onOpenFile} />)
    await userEvent.click(screen.getByText('Open File'))
    expect(onOpenFile).toHaveBeenCalledOnce()
  })

  it('calls onOpenDirectory when Open Folder is clicked', async () => {
    const onOpenDirectory = vi.fn()
    render(<Toolbar {...defaultProps} onOpenDirectory={onOpenDirectory} />)
    await userEvent.click(screen.getByText('Open Folder'))
    expect(onOpenDirectory).toHaveBeenCalledOnce()
  })

  it('calls onToggleTheme when theme button is clicked', async () => {
    const onToggleTheme = vi.fn()
    render(<Toolbar {...defaultProps} onToggleTheme={onToggleTheme} />)
    await userEvent.click(screen.getByLabelText('Toggle theme'))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('calls onToggleSidebar when sidebar button is clicked', async () => {
    const onToggleSidebar = vi.fn()
    render(<Toolbar {...defaultProps} onToggleSidebar={onToggleSidebar} />)
    await userEvent.click(screen.getByLabelText('Toggle sidebar'))
    expect(onToggleSidebar).toHaveBeenCalledOnce()
  })

  it('calls onToggleToc when TOC button is clicked', async () => {
    const onToggleToc = vi.fn()
    render(<Toolbar {...defaultProps} onToggleToc={onToggleToc} />)
    await userEvent.click(screen.getByLabelText('Toggle TOC'))
    expect(onToggleToc).toHaveBeenCalledOnce()
  })

  it('displays the filename when provided', () => {
    render(<Toolbar {...defaultProps} fileName="README.md" />)
    expect(screen.getByText('README.md')).toBeInTheDocument()
  })

  it('does not display a filename when null', () => {
    render(<Toolbar {...defaultProps} fileName={null} />)
    expect(screen.queryByTestId('toolbar-filename')).not.toBeInTheDocument()
  })

  it('marks the sidebar button as active when sidebarOpen is true', () => {
    render(<Toolbar {...defaultProps} sidebarOpen={true} />)
    expect(screen.getByLabelText('Toggle sidebar')).toHaveClass('active')
  })

  it('marks the TOC button as active when tocOpen is true', () => {
    render(<Toolbar {...defaultProps} tocOpen={true} />)
    expect(screen.getByLabelText('Toggle TOC')).toHaveClass('active')
  })
})
