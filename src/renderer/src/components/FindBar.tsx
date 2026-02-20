import { useState, useEffect, useRef } from 'react'

interface FindBarProps {
  onClose: () => void
}

export function FindBar({ onClose }: FindBarProps): JSX.Element {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<{ activeMatchOrdinal: number; matches: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    return () => { window.api.stopFind() }
  }, [])

  useEffect(() => {
    const unlisten = window.api.onFindResult((r) => setResult(r))
    return unlisten
  }, [])

  useEffect(() => {
    if (query.trim()) {
      window.api.findInPage(query, true)
    } else {
      window.api.stopFind()
      setResult(null)
    }
  }, [query])

  const navigate = (forward: boolean): void => {
    if (query.trim()) window.api.findInPage(query, forward)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') navigate(!e.shiftKey)
    if (e.key === 'Escape') onClose()
  }

  const countLabel = result
    ? result.matches === 0 ? 'No results' : `${result.activeMatchOrdinal} / ${result.matches}`
    : null

  return (
    <div className="find-bar">
      <input
        ref={inputRef}
        className="find-input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find in page…"
        spellCheck={false}
      />
      {countLabel && <span className="find-count">{countLabel}</span>}
      <button className="find-nav-btn" onClick={() => navigate(false)} title="Previous (Shift+Enter)">
        <IconChevronUp />
      </button>
      <button className="find-nav-btn" onClick={() => navigate(true)} title="Next (Enter)">
        <IconChevronDown />
      </button>
      <button className="find-close-btn" onClick={onClose} title="Close (Escape)">×</button>
    </div>
  )
}

function IconChevronUp(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconChevronDown(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
