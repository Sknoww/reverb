// src/main/projectManager.ts
import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { Project } from './types'

// Projects directory within user data folder
const projectsDir = path.join(app.getPath('userData'), 'projects')

// Create projects directory if it doesn't exist
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true })
}

export const saveProject = (project: Project): void => {
  const filePath = path.join(projectsDir, `${project.id}.json`)
  fs.writeFileSync(filePath, JSON.stringify(project, null, 2))
}

export const getProject = (projectId: string): Project | null => {
  const filePath = path.join(projectsDir, `${projectId}.json`)
  if (!fs.existsSync(filePath)) return null

  const projectData = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(projectData) as Project
}

export const getAllProjects = (): Project[] => {
  if (!fs.existsSync(projectsDir)) return []

  const projectFiles = fs.readdirSync(projectsDir).filter((file) => file.endsWith('.json'))
  return projectFiles.map((file) => {
    const projectData = fs.readFileSync(path.join(projectsDir, file), 'utf-8')
    return JSON.parse(projectData) as Project
  })
}

export const deleteProject = (projectId: string): boolean => {
  const filePath = path.join(projectsDir, `${projectId}.json`)
  if (!fs.existsSync(filePath)) return false

  fs.unlinkSync(filePath)
  return true
}
