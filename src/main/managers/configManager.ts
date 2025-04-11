import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { AdbCommand, Config } from '../types'
import { setProjectsDirectory } from './projectManager'

const configFilePath = path.join(app.getPath('userData'), 'config.json')
const defaultConfig = {
  saveLocation: path.join(app.getPath('userData'), 'projects'),
  recentProjectId: '',
  mostRecentProjectIds: [],
  commonCommands: []
}

export const loadConfig = (): Config => {
  try {
    if (fs.existsSync(configFilePath)) {
      console.log('Found config file:', configFilePath)
      const config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'))
      setProjectsDirectory(config.saveLocation)
      return config
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }

  // If we couldn't load settings, create with defaults and save
  console.log('No config found, creating with defaults')
  fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 2))
  return defaultConfig
}

export const saveConfig = (config: Config): boolean => {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))

    if (config.saveLocation) {
      setProjectsDirectory(config.saveLocation)
    }

    return true
  } catch (error) {
    console.error('Failed to save config:', error)
    return false
  }
}

export const getConfigFilePath = (): string => {
  return configFilePath
}

export const updateRecentProjectId = (projectId: string): void => {
  const newConfig = { ...loadConfig(), recentProjectId: projectId }
  try {
    console.log('Updating recent project ID:', projectId)
    fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2))
  } catch (error) {
    console.error('Failed to update recent project ID:', error)
  }
}

export const updateRecentProjectIds = (previousProjectId: string, newProjectId: string): void => {
  const config = loadConfig()
  var mostRecentProjectIds = config.mostRecentProjectIds
  // Remove current project ID from most recent project IDs
  mostRecentProjectIds = mostRecentProjectIds.filter((projectId) => projectId !== newProjectId)
  // Add new project ID to most recent project IDs
  mostRecentProjectIds.push(previousProjectId)
  // Limit it to the last 5 items
  mostRecentProjectIds = mostRecentProjectIds.slice(0, 5)

  const newConfig = { ...config, mostRecentProjectIds }
  console.log('Updating most recent project IDs:', mostRecentProjectIds)
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2))
  } catch (error) {
    console.error('Failed to update most recent project IDs:', error, newConfig)
  }
}

export const updateCommonCommands = (commands: AdbCommand[]): void => {
  const newConfig = { ...loadConfig(), commonCommands: commands }
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2))
  } catch (error) {
    console.error('Failed to update common commands:', error, newConfig)
  }
}
