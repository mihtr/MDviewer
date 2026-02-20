import { contextBridge, ipcRenderer } from 'electron'

export interface FileResult {
  path: string
  content: string
}

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modified: number
}

export interface ReadFileResult {
  content: string | null
  error: string | null
}

export interface ElectronAPI {
  openFile: () => Promise<FileResult | null>
  openDirectory: () => Promise<string | null>
  readFile: (filePath: string) => Promise<ReadFileResult>
  readDirectory: (dirPath: string) => Promise<FileNode[]>
  watchFile: (filePath: string) => Promise<void>
  unwatchFile: () => Promise<void>
  onFileChanged: (callback: (data: FileResult) => void) => () => void
  watchDirectory: (dirPath: string) => Promise<void>
  unwatchDirectory: () => Promise<void>
  onDirChanged: (callback: (data: { path: string }) => void) => () => void
}

const api: ElectronAPI = {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDirectory', dirPath),
  watchFile: (filePath) => ipcRenderer.invoke('fs:watchFile', filePath),
  unwatchFile: () => ipcRenderer.invoke('fs:unwatchFile'),
  onFileChanged: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, data: FileResult): void => callback(data)
    ipcRenderer.on('fs:fileChanged', handler)
    return () => ipcRenderer.removeListener('fs:fileChanged', handler)
  },
  watchDirectory: (dirPath) => ipcRenderer.invoke('fs:watchDirectory', dirPath),
  unwatchDirectory: () => ipcRenderer.invoke('fs:unwatchDirectory'),
  onDirChanged: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { path: string }): void => callback(data)
    ipcRenderer.on('fs:dirChanged', handler)
    return () => ipcRenderer.removeListener('fs:dirChanged', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: ElectronAPI
  }
}
