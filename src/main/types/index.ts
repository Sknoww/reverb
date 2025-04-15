export interface AdbCommand {
  id: string
  name: string
  keyword: string
  type: string
  value: string
  description?: string
}

export interface Flow {
  id: string
  name: string
  description?: string
  commands: AdbCommand[]
  delay: number
}

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  commands: AdbCommand[]
  flows: Flow[]
  collections: Collection[]
}

export interface Config {
  saveLocation: string
  recentProjectId: string
  mostRecentProjectIds: string[]
  commonCommands: AdbCommand[]
}

export interface Collection {
  id: string
  name: string
  description?: string
  collectionFilePath: string
}
