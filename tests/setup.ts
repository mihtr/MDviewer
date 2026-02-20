import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.api — Electron's contextBridge is not available in jsdom
Object.defineProperty(window, 'api', {
  writable: true,
  value: {
    openFile: vi.fn(),
    openDirectory: vi.fn(),
    readFile: vi.fn().mockResolvedValue({ content: null, error: null }),
    readDirectory: vi.fn().mockResolvedValue([]),
    watchFile: vi.fn().mockResolvedValue(undefined),
    unwatchFile: vi.fn().mockResolvedValue(undefined),
    onFileChanged: vi.fn().mockReturnValue(() => {}),
    watchDirectory: vi.fn().mockResolvedValue(undefined),
    unwatchDirectory: vi.fn().mockResolvedValue(undefined),
    onDirChanged: vi.fn().mockReturnValue(() => {}),
  }
})
