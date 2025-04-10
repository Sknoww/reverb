// src/renderer/src/types/index.ts
export interface AdbCommand {
  name: string
  keyword: string
  type: string
  value: string
  description?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  commands: AdbCommand[]
}

export interface Config {
  saveLocation: string
  recentProjectId: string
  mostRecentProjectIds: string[]
  commonCommands: AdbCommand[]
}
