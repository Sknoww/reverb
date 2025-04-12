import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron'
import { join } from 'path'
import logo from '../../resources/icon.png?asset'

import { executeAdbCommand } from './managers/adbManager'
import {
  getConfigFilePath,
  loadConfig,
  saveConfig,
  updateCommonCommands,
  updateRecentProjectId,
  updateRecentProjectIds
} from './managers/configManager'
import { openInEditor, selectFile, selectFolder } from './managers/dialogManager'
import { deleteProject, getAllProjects, getProject, saveProject } from './managers/projectManager'

nativeTheme.themeSource = 'dark'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minHeight: 600,
    minWidth: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    },
    backgroundColor: '#535657',
    icon: join(__dirname, '../../resources/icon.png')
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  setupIPC()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Set up IPC handlers
function setupIPC() {
  // File handlers
  ipcMain.handle('dialog:selectFolder', () => selectFolder())
  ipcMain.handle('dialog:selectFile', () => selectFile())
  ipcMain.handle('dialog:openInEditor', (_, filePath) => openInEditor(filePath))

  // Config handlers
  ipcMain.handle('config:get', () => loadConfig())
  ipcMain.handle('config:save', (_, config) => saveConfig(config))
  ipcMain.handle('config:getFilePath', () => getConfigFilePath())
  ipcMain.handle('config:recentProjectId', (_, projectId) => updateRecentProjectId(projectId))
  ipcMain.handle('config:recentProjectIds', (_, previousProjectId, newProjectId) =>
    updateRecentProjectIds(previousProjectId, newProjectId)
  )
  ipcMain.handle('config:commonCommands', (_, commands) => updateCommonCommands(commands))

  // Project handlers
  ipcMain.handle('project:save', (_, project) => saveProject(project))
  ipcMain.handle('project:get', (_, projectId) => getProject(projectId))
  ipcMain.handle('project:getAll', () => getAllProjects())
  ipcMain.handle('project:delete', (_, projectId) => deleteProject(projectId))

  // ADB handlers
  ipcMain.handle('adb:execute', async (_, intent, value) => {
    try {
      return await executeAdbCommand(intent, value)
    } catch (error) {
      return { error: (error as Error).message }
    }
  })

  console.log('All IPC handlers registered')
}
