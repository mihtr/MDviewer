import { describe, it, expect } from 'vitest'
import { isMarkdown } from '../../src/renderer/src/utils'

describe('isMarkdown', () => {
  it('recognises .md files', () => {
    expect(isMarkdown('README.md')).toBe(true)
  })

  it('recognises .markdown files', () => {
    expect(isMarkdown('notes.markdown')).toBe(true)
  })

  it('recognises .mdx files', () => {
    expect(isMarkdown('page.mdx')).toBe(true)
  })

  it('recognises .txt files', () => {
    expect(isMarkdown('file.txt')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isMarkdown('README.MD')).toBe(true)
    expect(isMarkdown('FILE.TXT')).toBe(true)
  })

  it('rejects .ts files', () => {
    expect(isMarkdown('index.ts')).toBe(false)
  })

  it('rejects .tsx files', () => {
    expect(isMarkdown('App.tsx')).toBe(false)
  })

  it('rejects .html files', () => {
    expect(isMarkdown('index.html')).toBe(false)
  })

  it('rejects files with no extension', () => {
    expect(isMarkdown('Makefile')).toBe(false)
  })

  it('rejects .json files', () => {
    expect(isMarkdown('package.json')).toBe(false)
  })
})
