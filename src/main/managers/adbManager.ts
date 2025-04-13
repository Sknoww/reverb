import { exec } from 'child_process'
import { app } from 'electron'
import path from 'path'

export interface AdbCommandResult {
  success: boolean
  output?: string
  error?: string
}

export const executeAdbCommand = async (
  intent: string,
  value: string
): Promise<AdbCommandResult> => {
  try {
    let adb
    if (process.platform === 'win32') {
      // Determine the system architecture
      adb = app.isPackaged
        ? path.join(process.resourcesPath, 'extraResources', 'adbWin\\adb.exe')
        : path.join(process.cwd(), 'extraResources', 'adbWin\\adb.exe')
    } else if (process.platform === 'darwin') {
      adb = app.isPackaged
        ? path.join(process.resourcesPath, 'extraResources', 'adbMac/adb')
        : path.join(process.cwd(), 'extraResources', 'adbMac/adb')
    }

    const command = `${adb} shell "am broadcast -a ${intent} --es data \\"${value}\\""`

    const adbResult = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing ADB command:', error)
        return {
          success: false,
          error: error.message
        }
      }

      if (stderr) {
        console.error('Error executing ADB command:', stderr)
        return {
          success: false,
          error: stderr
        }
      }
      console.log('stdout:', stdout)
      return {
        success: true,
        output: stdout
      }
    })

    const result = adbResult.stdout ? adbResult.stdout.toString() : undefined

    return {
      success: true,
      output: result
    }
  } catch (error: any) {
    console.error('ADB command failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown error executing ADB command'
    }
  }
}
