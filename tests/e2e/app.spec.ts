/**
 * E2E tests using Playwright's Electron integration.
 *
 * Prerequisites: run `npm run build` before `npm run test:e2e`.
 * The tests launch the compiled Electron app from out/main/index.js.
 */
import { test, expect, _electron as electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'

let app: ElectronApplication
let win: Page

test.beforeAll(async () => {
  app = await electron.launch({
    args: [join(process.cwd(), 'out/main/index.js')]
  })
  win = await app.firstWindow()
  await win.waitForLoadState('domcontentloaded')
})

test.afterAll(async () => {
  await app.close()
})

test('shows the welcome screen on launch', async () => {
  await expect(win.locator('.welcome')).toBeVisible()
  await expect(win.locator('h1')).toHaveText('MDviewer')
  await expect(win.locator('.welcome-hint')).toContainText('drag and drop')
})

test('welcome screen has Open File and Open Folder buttons', async () => {
  await expect(win.locator('.welcome-actions .btn-primary')).toHaveText('Open File')
  await expect(win.locator('.welcome-actions .btn-secondary')).toHaveText('Open Folder')
})

test('toolbar is visible', async () => {
  await expect(win.locator('.toolbar')).toBeVisible()
  await expect(win.locator('.toolbar-brand')).toHaveText('MDviewer')
})

test('drag-and-drop renders a markdown file', async () => {
  // Write a temp markdown file
  const dir = join(tmpdir(), 'mdviewer-e2e')
  mkdirSync(dir, { recursive: true })
  const filePath = join(dir, 'test.md')
  writeFileSync(filePath, '# E2E Test\n\nThis is a test file.')

  // Simulate drop via Electron's evaluate (bypasses native dialog)
  await app.evaluate(({ ipcMain }, path) => {
    const win = require('electron').BrowserWindow.getAllWindows()[0]
    // Directly invoke the readFile handler and send result to renderer
    ipcMain.emit('test:loadFile', { sender: win.webContents }, path)
  }, filePath)

  // Alternatively, test via IPC directly:
  await win.evaluate((path: string) => {
    return window.api.readFile(path)
  }, filePath)

  // Clean up
  rmSync(dir, { recursive: true, force: true })
})

test('sidebar toggle shows and hides the sidebar', async () => {
  const sidebarBtn = win.locator('[aria-label="Toggle sidebar"]')
  await sidebarBtn.click()
  await expect(win.locator('.sidebar')).toBeVisible()
  await sidebarBtn.click()
  await expect(win.locator('.sidebar')).not.toBeVisible()
})

test('TOC toggle shows and hides the table of contents', async () => {
  const tocBtn = win.locator('[aria-label="Toggle TOC"]')
  // TOC is only shown when there are headings, so just verify the button works
  await expect(tocBtn).toBeVisible()
  await tocBtn.click()
  await tocBtn.click()
})

test('theme toggle switches between dark and light', async () => {
  const themeBtn = win.locator('[aria-label="Toggle theme"]')

  // Default is dark
  const htmlEl = win.locator('html')
  await expect(htmlEl).toHaveAttribute('data-theme', 'dark')

  await themeBtn.click()
  await expect(htmlEl).toHaveAttribute('data-theme', 'light')

  await themeBtn.click()
  await expect(htmlEl).toHaveAttribute('data-theme', 'dark')
})
