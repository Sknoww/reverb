import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron'
import path, { join } from 'path'
import logo from '../../resources/icon.png?asset'

import { execSync } from 'child_process'
import fs from 'fs'
import { getLogsDirectory } from './logger'
import { executeAdbApplicationReset, executeAdbCommand } from './managers/adbManager'
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

function ensureAdbPermissions() {
  try {
    const adbPath = app.isPackaged
      ? path.join(process.resourcesPath, 'extraResources', 'adb')
      : path.join(process.cwd(), 'extraResources', 'adb')

    if (fs.existsSync(adbPath)) {
      try {
        execSync(`chmod +x "${adbPath}"`)
        console.log('ADB permissions set successfully')
      } catch (error) {
        console.error('Error setting ADB permissions:', error)
      }
    } else {
      console.error('ADB executable not found at path:', adbPath)
    }
  } catch (error) {
    console.error('Error in ensureAdbPermissions:', error)
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minHeight: 600,
    minWidth: 1000,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      enableWebSQL: false,
      webSecurity: true,
      webgl: false,
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  ensureAdbPermissions()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  setupIPC()
})

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

  // Logger handlers
  ipcMain.handle('logger:getLogsDirectory', () => getLogsDirectory())

  // ADB handlers
  ipcMain.handle('adb:execute', async (_, intent, value) => {
    try {
      return await executeAdbCommand(intent, value)
    } catch (error) {
      return { error: (error as Error).message }
    }
  })

  ipcMain.handle('adb:applicationReset', async () => {
    try {
      return await executeAdbApplicationReset()
    } catch (error) {
      return { error: (error as Error).message }
    }
  })

  console.log('All IPC handlers registered')
}
