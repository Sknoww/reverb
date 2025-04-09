import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, ipcMain, nativeTheme, shell } from 'electron'
import fs from 'fs'
import path, { join } from 'path'
import icon from '../../resources/icon.png?asset'

nativeTheme.themeSource = 'dark'

const settingsFilePath = path.join(app.getPath('userData'), 'settings.json')
const defaultSettings = {
  saveLocation: path.join(app.getPath('userData'), 'projects')
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    },
    backgroundColor: '#535657'
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
import { executeAdbCommand } from './adbUtils'

// Add IPC handler for ADB commands
ipcMain.handle('adb:execute', async (_, command) => {
  try {
    return await executeAdbCommand(command)
  } catch (error) {
    return { error: (error as Error).message }
  }
})

//SETTINGS
// Load settings
const loadSettings = () => {
  try {
    if (fs.existsSync(settingsFilePath)) {
      return JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'))
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }

  // If we couldn't load settings, create with defaults and save
  fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2))
  return defaultSettings
}

// Set up IPC handlers
function setupIPC() {
  // Get settings
  ipcMain.handle('settings:get', () => {
    console.log('Received settings:get request')
    const settings = loadSettings()
    console.log('Returning settings:', settings)
    return settings
  })

  // Save settings
  ipcMain.handle('settings:save', (_, newSettings) => {
    console.log('Saving settings:', newSettings)
    try {
      fs.writeFileSync(settingsFilePath, JSON.stringify(newSettings, null, 2))
      return true
    } catch (error) {
      console.error('Failed to save settings:', error)
      return false
    }
  })

  // Select folder dialog
  ipcMain.handle('dialog:selectFolder', async () => {
    console.log('Opening folder selection dialog')
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Save Location'
    })

    if (!canceled && filePaths.length > 0) {
      return filePaths[0]
    }
    return null
  })
}
