import { Project } from './types'

declare global {
  interface Window {
    projectAPI: {
      saveProject: (project: Project) => Promise<void>
      getProject: (projectId: string) => Promise<Project | null>
      getAllProjects: () => Promise<Project[]>
      deleteProject: (projectId: string) => Promise<boolean>
    }
    adbAPI: {
      executeCommand: (command: string) => Promise<string | { error: string }>
    }
  }
}

interface Window {
  // ... existing code
  adbAPI: {
    executeCommand: (command: string) => Promise<string | { error: string }>
  }
}

interface Settings {
  saveLocation: string
  // Add other settings as needed
}

declare global {
  interface Window {
    // Your existing declarations...

    settingsAPI: {
      getSettings: () => Promise<Settings>
      saveSettings: (settings: Partial<Settings>) => Promise<boolean>
      selectSaveLocation: () => Promise<string | null>
      notifySaveLocationChanged: (location: string) => void
    }
  }
}

export {}
