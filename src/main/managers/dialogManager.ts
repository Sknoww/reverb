import { dialog, shell } from 'electron'
import path from 'path'
import logger from '../logger'

// Select folder dialog
export const selectFolder = async () => {
  logger.info('Opening folder selection dialog')
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Save Location'
  })

  if (!canceled && filePaths.length > 0) {
    return filePaths[0]
  }
  return null
}

// Select file dialog
export const selectFile = async () => {
  logger.info('Opening file selection dialog')
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    title: 'Select File'
  })

  if (!canceled && filePaths.length > 0) {
    return path.basename(filePaths[0])
  }
  return null
}

export const openInEditor = async (filePath: string) => {
  try {
    logger.info('Opening file:', filePath)
    await shell.openPath(filePath)
    return { success: true }
  } catch (error: any) {
    logger.error('Error opening file:', error)
    return { success: false, error: error.message }
  }
}
