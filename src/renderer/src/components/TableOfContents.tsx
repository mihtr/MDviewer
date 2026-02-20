import type { Heading } from '../types'

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps): JSX.Element {
  const minLevel = Math.min(...headings.map((h) => h.level))

  const handleClick = (id: string): void => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="toc">
      <div className="toc-header">On this page</div>
      <ul className="toc-list">
        {headings.map((h, i) => (
          <li
            key={`${h.id}-${i}`}
            className="toc-item"
            style={{ paddingLeft: `${(h.level - minLevel) * 12}px` }}
          >
            <button
              className="toc-link"
              onClick={() => handleClick(h.id)}
              title={h.text}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
