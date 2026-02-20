import { describe, it, expect } from 'vitest'
import { parentDir } from '../../src/renderer/src/utils'

describe('parentDir', () => {
  it('extracts the parent from a Unix path', () => {
    expect(parentDir('/home/user/docs/README.md')).toBe('/home/user/docs')
  })

  it('extracts the parent from a Windows path', () => {
    expect(parentDir('C:\\Users\\me\\docs\\README.md')).toBe('C:\\Users\\me\\docs')
  })

  it('works with forward slashes on Windows-style paths', () => {
    expect(parentDir('C:/Users/me/docs/README.md')).toBe('C:/Users/me/docs')
  })

  it('handles a file in a top-level directory', () => {
    expect(parentDir('/docs/file.md')).toBe('/docs')
  })
})
