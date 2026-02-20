import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { readFileSync, readdirSync, statSync, watchFile, unwatchFile } from 'fs'

let mainWindow: BrowserWindow | null = null
let watchedFilePath: string | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 700,
    minHeight: 500,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#1a1a1a',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: Open a single markdown file via dialog
ipcMain.handle('dialog:openFile', async () => {
  if (!mainWindow) return null
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Markdown File',
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'mdx', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  if (canceled || filePaths.length === 0) return null
  const filePath = filePaths[0]
  const content = readFileSync(filePath, 'utf-8')
  return { path: filePath, content }
})

// IPC: Open a directory via dialog
ipcMain.handle('dialog:openDirectory', async () => {
  if (!mainWindow) return null
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Folder',
    properties: ['openDirectory']
  })
  if (canceled || filePaths.length === 0) return null
  return filePaths[0]
})

// IPC: Read a file by path
ipcMain.handle('fs:readFile', (_event, filePath: string) => {
  try {
    return { content: readFileSync(filePath, 'utf-8'), error: null }
  } catch (err) {
    return { content: null, error: String(err) }
  }
})

// IPC: Read directory tree (one level deep — renderer can recurse)
ipcMain.handle('fs:readDirectory', (_event, dirPath: string) => {
  try {
    const entries = readdirSync(dirPath)
    return entries.map((name) => {
      const fullPath = join(dirPath, name)
      try {
        const stat = statSync(fullPath)
        return {
          name,
          path: fullPath,
          isDirectory: stat.isDirectory(),
          size: stat.size,
          modified: stat.mtimeMs
        }
      } catch {
        return { name, path: fullPath, isDirectory: false, size: 0, modified: 0 }
      }
    })
  } catch {
    return []
  }
})

// IPC: Watch a file for external changes and notify renderer
ipcMain.handle('fs:watchFile', (_event, filePath: string) => {
  if (watchedFilePath) {
    unwatchFile(watchedFilePath)
  }
  watchedFilePath = filePath
  watchFile(filePath, { interval: 500 }, () => {
    try {
      const content = readFileSync(filePath, 'utf-8')
      mainWindow?.webContents.send('fs:fileChanged', { path: filePath, content })
    } catch {
      // File may have been deleted
    }
  })
})

ipcMain.handle('fs:unwatchFile', () => {
  if (watchedFilePath) {
    unwatchFile(watchedFilePath)
    watchedFilePath = null
  }
})
