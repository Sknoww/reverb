import { exec } from 'child_process'
import { promisify } from 'util'
const os = require('os')

const execAsync = promisify(exec)

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
      adb = '.\\adb\\adb.exe'
      // Simple approach - just use exec with the basic adb command
    } else if (process.platform === 'darwin') {
      adb = 'adb'
    }

    const adbResult = await execAsync(adb + ` shell am broadcast -a ${intent} --es data ${value}`)

    console.log('ADB output:', adbResult.stdout)

    if (adbResult.stderr) {
      console.warn('ADB stderr:', adbResult.stderr)
    }

    return {
      success: true,
      output: adbResult.stdout
    }
  } catch (error: any) {
    console.error('ADB command failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown error executing ADB command'
    }
  }
}
