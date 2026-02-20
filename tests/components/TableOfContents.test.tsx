import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableOfContents } from '../../src/renderer/src/components/TableOfContents'
import type { Heading } from '../../src/renderer/src/types'

const headings: Heading[] = [
  { id: 'introduction', text: 'Introduction', level: 1 },
  { id: 'getting-started', text: 'Getting Started', level: 2 },
  { id: 'installation', text: 'Installation', level: 3 },
  { id: 'usage', text: 'Usage', level: 2 }
]

describe('TableOfContents', () => {
  it('renders the "On this page" header', () => {
    render(<TableOfContents headings={headings} />)
    expect(screen.getByText('On this page')).toBeInTheDocument()
  })

  it('renders all heading entries', () => {
    render(<TableOfContents headings={headings} />)
    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Installation')).toBeInTheDocument()
    expect(screen.getByText('Usage')).toBeInTheDocument()
  })

  it('renders correct number of items', () => {
    render(<TableOfContents headings={headings} />)
    expect(screen.getAllByRole('button')).toHaveLength(headings.length)
  })

  it('calls scrollIntoView when a heading is clicked', async () => {
    const mockEl = { scrollIntoView: vi.fn() }
    vi.spyOn(document, 'getElementById').mockReturnValue(mockEl as unknown as HTMLElement)

    render(<TableOfContents headings={headings} />)
    await userEvent.click(screen.getByText('Introduction'))

    expect(document.getElementById).toHaveBeenCalledWith('introduction')
    expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('applies indent based on heading level', () => {
    render(<TableOfContents headings={headings} />)
    const items = screen.getAllByRole('listitem')
    // h1 (min level) → 0px indent; h2 → 12px; h3 → 24px
    expect(items[0]).toHaveStyle({ paddingLeft: '0px' })
    expect(items[1]).toHaveStyle({ paddingLeft: '12px' })
    expect(items[2]).toHaveStyle({ paddingLeft: '24px' })
  })

  it('renders an empty list when no headings provided', () => {
    render(<TableOfContents headings={[]} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  beforeEach(() => {
    vi.restoreAllMocks()
  })
})
