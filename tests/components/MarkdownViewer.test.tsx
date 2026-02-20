import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkdownViewer } from '../../src/renderer/src/components/MarkdownViewer'

// react-markdown is ESM-only. Mock it to focus tests on MarkdownViewer's own
// behaviour: heading extraction (DOM query), basePath resolution, copy button.
vi.mock('react-markdown', () => ({
  default: ({ children, components }: {
    children: string
    components?: Record<string, (props: Record<string, unknown>) => JSX.Element>
  }) => {
    // Render a real <h1> so querySelectorAll picks it up for heading extraction
    // Render two imgs so we can test both relative and absolute src handling
    const Pre = components?.pre
    const Img = components?.img
    return (
      <div>
        <h1 id="hello">Hello</h1>
        {Img
          ? <>
              <Img src="photo.png" alt="relative-photo" node={{}} />
              <Img src="https://example.com/img.png" alt="absolute-photo" node={{}} />
            </>
          : <>
              <img src="photo.png" alt="relative-photo" />
              <img src="https://example.com/img.png" alt="absolute-photo" />
            </>
        }
        {Pre ? <Pre node={{}}>{'const x = 1'}</Pre> : <pre>const x = 1</pre>}
        <p>{children}</p>
      </div>
    )
  }
}))

vi.mock('remark-gfm', () => ({ default: () => {} }))
vi.mock('remark-breaks', () => ({ default: () => {} }))
vi.mock('rehype-highlight', () => ({ default: () => {} }))
vi.mock('rehype-slug', () => ({ default: () => {} }))

describe('MarkdownViewer', () => {
  it('renders the markdown content', () => {
    render(<MarkdownViewer content="Hello world" basePath={null} onHeadingsExtracted={vi.fn()} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('calls onHeadingsExtracted after render', () => {
    const onHeadingsExtracted = vi.fn()
    render(
      <MarkdownViewer content="# Hello" basePath={null} onHeadingsExtracted={onHeadingsExtracted} />
    )
    expect(onHeadingsExtracted).toHaveBeenCalled()
    const headings = onHeadingsExtracted.mock.calls[0][0]
    expect(headings.length).toBeGreaterThan(0)
    expect(headings[0].text).toBe('Hello')
  })

  it('resolves relative image src using basePath', () => {
    render(
      <MarkdownViewer content="" basePath="C:/docs" onHeadingsExtracted={vi.fn()} />
    )
    const img = screen.getByRole('img', { name: 'relative-photo' })
    expect(img).toHaveAttribute('src', 'file:///C:/docs/photo.png')
  })

  it('leaves absolute image URLs unchanged', () => {
    render(
      <MarkdownViewer content="" basePath="C:/docs" onHeadingsExtracted={vi.fn()} />
    )
    const img = screen.getByRole('img', { name: 'absolute-photo' })
    expect(img).toHaveAttribute('src', 'https://example.com/img.png')
  })

  it('shows a copy button on code blocks', () => {
    render(<MarkdownViewer content="```js\nconst x = 1\n```" basePath={null} onHeadingsExtracted={vi.fn()} />)
    expect(screen.getByTitle('Copy code')).toBeInTheDocument()
  })

  it('copy button text changes to check after click', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
    render(<MarkdownViewer content="```js\nconst x = 1\n```" basePath={null} onHeadingsExtracted={vi.fn()} />)
    const btn = screen.getByTitle('Copy code')
    await userEvent.click(btn)
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })
})
