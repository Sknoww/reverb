// src/preload/index.ts (add to your existing preload)
import { contextBridge, ipcRenderer } from 'electron'

// Expose project management API to renderer
contextBridge.exposeInMainWorld('projectAPI', {
  saveProject: (project) => ipcRenderer.invoke('project:save', project),
  getProject: (projectId) => ipcRenderer.invoke('project:get', projectId),
  getAllProjects: () => ipcRenderer.invoke('project:getAll'),
  deleteProject: (projectId) => ipcRenderer.invoke('project:delete', projectId)
})

// Expose ADB API
contextBridge.exposeInMainWorld('adbAPI', {
  executeCommand: (command) => ipcRenderer.invoke('adb:execute', command)
})

// src/preload/index.ts (add to your existing code)
contextBridge.exposeInMainWorld('settingsAPI', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  selectSaveLocation: () => ipcRenderer.invoke('dialog:selectFolder'),
  notifySaveLocationChanged: (location) =>
    ipcRenderer.send('settings:saveLocationChanged', location)
})
