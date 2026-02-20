import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import type { Components } from 'react-markdown'
import type { Heading } from '../types'

interface MarkdownViewerProps {
  content: string
  onHeadingsExtracted: (headings: Heading[]) => void
}

export function MarkdownViewer({ content, onHeadingsExtracted }: MarkdownViewerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const els = containerRef.current.querySelectorAll('h1,h2,h3,h4,h5,h6')
    const headings: Heading[] = []
    els.forEach((el) => {
      const level = parseInt(el.tagName[1])
      const id = el.id || ''
      const text = el.textContent ?? ''
      if (text) headings.push({ id, text, level })
    })
    onHeadingsExtracted(headings)
  }, [content, onHeadingsExtracted])

  return (
    <div className="markdown-scroll">
      <article ref={containerRef} className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight, rehypeSlug]}
          components={mdComponents}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}

const mdComponents: Components = {
  a({ href, children, ...props }) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    )
  },
  pre({ children, ...props }) {
    return <CodeBlock preProps={props}>{children}</CodeBlock>
  }
}

function CodeBlock({ children, preProps }: {
  children: React.ReactNode
  preProps: React.HTMLAttributes<HTMLPreElement>
}): JSX.Element {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    const text = preRef.current?.textContent ?? ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="code-block-wrapper">
      <pre ref={preRef} {...preProps}>{children}</pre>
      <button className="copy-btn" onClick={handleCopy} title="Copy code">
        {copied ? <IconCheck /> : <IconCopy />}
      </button>
    </div>
  )
}

function IconCopy(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M10 4V2.5A1.5 1.5 0 0 0 8.5 1h-7A1.5 1.5 0 0 0 0 2.5v7A1.5 1.5 0 0 0 1.5 11H4"
        stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

function IconCheck(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l4 4 6-7" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
