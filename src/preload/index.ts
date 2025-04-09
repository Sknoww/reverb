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
contextBridge.exposeInMainWorld('configAPI', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),
  selectSaveLocation: () => ipcRenderer.invoke('dialog:selectFolder'),
  notifySaveLocationChanged: (location) => ipcRenderer.send('config:saveLocationChanged', location),
  updateRecentProjectId: (projectId) => ipcRenderer.send('config:recentProjectId', projectId)
})
