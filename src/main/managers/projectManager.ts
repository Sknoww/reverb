// src/main/projectManager.ts
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { Project } from '../types'
import { loadConfig } from './configManager'

let projectsDir = path.join(app.getPath('userData'), 'projects')

// Function to update the projects directory
export const setProjectsDirectory = (directory: string): void => {
  projectsDir = directory

  // Create projects directory if it doesn't exist
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true })
  }
}

// Initialize the directory
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true })
}

// Create projects directory if it doesn't exist
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true })
}

export const saveProject = (project: Project): void => {
  const filePath = path.join(projectsDir, `${project.id}.project.json`)
  fs.writeFileSync(filePath, JSON.stringify(project, null, 2))
}

export const getProject = (projectId: string): Project | null => {
  console.log('Getting project:', projectId)
  console.log('Projects dir:', projectsDir)
  const filePath = path.join(projectsDir, projectId)
  if (!fs.existsSync(filePath)) return null
  console.log('Project file path:', filePath)

  const projectData = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(projectData) as Project
}

export const getAllProjects = (): Project[] => {
  if (!fs.existsSync(projectsDir)) return []

  const config = loadConfig()
  var projectFiles: string[] = []
  config.mostRecentProjectIds.forEach((projectId) => {
    const filePath = path.join(projectsDir, projectId)
    if (fs.existsSync(filePath)) {
      projectFiles.push(filePath)
    }
  })
  const filePath = path.join(projectsDir, config.recentProjectId)
  if (fs.existsSync(filePath)) {
    projectFiles.push(filePath)
  }

  return projectFiles.map((file) => {
    const projectData = fs.readFileSync(path.join(file), 'utf-8')
    return JSON.parse(projectData) as Project
  })
}

export const deleteProject = (projectId: string): boolean => {
  const filePath = path.join(projectsDir, `${projectId}.json`)
  if (!fs.existsSync(filePath)) return false

  fs.unlinkSync(filePath)
  return true
}
