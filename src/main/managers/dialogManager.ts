import { dialog, shell } from 'electron'
import path from 'path'

// Select folder dialog
export const selectFolder = async () => {
  console.log('Opening folder selection dialog')
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
  console.log('Opening file selection dialog')
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
    console.log('Opening file:', filePath)
    await shell.openPath(filePath)
    return { success: true }
  } catch (error: any) {
    console.error('Error opening file:', error)
    return { success: false, error: error.message }
  }
}
