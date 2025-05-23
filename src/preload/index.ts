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
  executeCommand: (intent, value) => ipcRenderer.invoke('adb:execute', intent, value),
  executeApplicationReset: () => ipcRenderer.invoke('adb:applicationReset')
})

contextBridge.exposeInMainWorld('configAPI', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),
  getConfigFilePath: () => ipcRenderer.invoke('config:getFilePath'),
  selectSaveLocation: () => ipcRenderer.invoke('dialog:selectFolder'),
  notifySaveLocationChanged: (location) => ipcRenderer.send('config:saveLocationChanged', location),
  updateRecentProjectId: (projectId) => ipcRenderer.invoke('config:recentProjectId', projectId),
  notifyRecentProjectIdChanged: (projectId) =>
    ipcRenderer.send('config:recentProjectIdChanged', projectId),
  updateRecentProjectIds: (previousProjectId, newProjectId) =>
    ipcRenderer.invoke('config:recentProjectIds', previousProjectId, newProjectId),
  notifyRecentProjectIdsChanged: (projectIds) =>
    ipcRenderer.send('config:recentProjectIdsChanged', projectIds),
  updateCommonCommands: (commands) => ipcRenderer.invoke('config:commonCommands', commands),
  notifyCommonCommandsChanged: (commands) =>
    ipcRenderer.send('config:commonCommandsChanged', commands)
})

contextBridge.exposeInMainWorld('dialogAPI', {
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
  openInEditor: (filePath) => ipcRenderer.invoke('dialog:openInEditor', filePath)
})

contextBridge.exposeInMainWorld('loggerAPI', {
  getLogsDirectory: () => ipcRenderer.invoke('logger:getLogsDirectory')
})
