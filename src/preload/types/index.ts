// src/renderer/src/types/index.ts
export interface AdbCommand {
  id: string
  name: string
  keyword: string
  command: string
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
