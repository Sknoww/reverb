import { Config } from '@/types'
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
      executeCommand: (intent: string, value: string) => Promise<string | { error: string }>
    }
    configAPI: {
      getConfig: () => Promise<Config>
      saveConfig: (config: Partial<Config>) => Promise<boolean>
      selectSaveLocation: () => Promise<string | null>
      notifySaveLocationChanged: (location: string) => void
      updateRecentProjectId: (projectId: string) => void
      notifyRecentProjectIdChanged: (projectId: string) => void
      updateRecentProjectIds: (previousProjectId: string, newProjectId: string) => void
      notifyRecentProjectIdsChanged: (projectIds: string[]) => void
      updateCommonCommands: (commands: AdbCommand[]) => void
    }
    dialogAPI: {
      selectFile: () => Promise<string | null>
      selectFolder: () => Promise<string | null>
    }
  }
}
