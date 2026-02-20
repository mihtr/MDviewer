import { describe, it, expect } from 'vitest'
import { resolveImageSrc } from '../../src/renderer/src/utils'

describe('resolveImageSrc', () => {
  it('returns empty string for undefined src', () => {
    expect(resolveImageSrc(undefined, '/some/dir')).toBe('')
  })

  it('returns empty string for empty src', () => {
    expect(resolveImageSrc('', '/some/dir')).toBe('')
  })

  it('passes through http URLs unchanged', () => {
    const url = 'http://example.com/img.png'
    expect(resolveImageSrc(url, '/some/dir')).toBe(url)
  })

  it('passes through https URLs unchanged', () => {
    const url = 'https://example.com/img.png'
    expect(resolveImageSrc(url, '/some/dir')).toBe(url)
  })

  it('passes through data URIs unchanged', () => {
    const url = 'data:image/png;base64,abc123'
    expect(resolveImageSrc(url, '/some/dir')).toBe(url)
  })

  it('passes through existing file:// URLs unchanged', () => {
    const url = 'file:///C:/images/img.png'
    expect(resolveImageSrc(url, 'C:/docs')).toBe(url)
  })

  it('returns src unchanged when basePath is null', () => {
    expect(resolveImageSrc('img.png', null)).toBe('img.png')
  })

  it('resolves a simple relative filename', () => {
    expect(resolveImageSrc('img.png', 'C:/docs')).toBe('file:///C:/docs/img.png')
  })

  it('resolves a relative path with subdirectory', () => {
    expect(resolveImageSrc('./assets/img.png', 'C:/docs')).toBe('file:///C:/docs/./assets/img.png')
  })

  it('normalises Windows backslashes in basePath', () => {
    expect(resolveImageSrc('img.png', 'C:\\Users\\me\\docs')).toBe('file:///C:/Users/me/docs/img.png')
  })

  it('normalises Windows backslashes in src', () => {
    expect(resolveImageSrc('assets\\img.png', 'C:/docs')).toBe('file:///C:/docs/assets/img.png')
  })
})
