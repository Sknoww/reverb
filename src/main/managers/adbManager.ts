import { exec as execCallback } from 'child_process'
import { app } from 'electron'
import path from 'path'
import { promisify } from 'util'
import logger from '../logger'

export interface AdbCommandResult {
  success: boolean
  output?: string
  error?: string
}

const getAdbPath = (): string => {
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
  return adb
}

export const executeAdbCommand = async (
  intent: string,
  value: string
): Promise<AdbCommandResult> => {
  try {
    const adb = getAdbPath()

    const command = `${adb} shell "am broadcast -a ${intent} --es data \\"${value}\\""`

    logger.info('Executing ADB command:', command)

    const adbResult = execCallback(command, (error, stdout, stderr) => {
      if (error) {
        logger.error('Error executing ADB command:', error)
        return {
          success: false,
          error: error.message
        }
      }

      if (stderr) {
        logger.error('Error executing ADB command:', stderr)
        return {
          success: false,
          error: stderr
        }
      }
      return {
        success: true,
        output: stdout
      }
    })

    const result = adbResult.stdout ? adbResult.stdout.toString() : undefined
    logger.info('ADB command result:', result)
    return {
      success: true,
      output: result
    }
  } catch (error: any) {
    logger.error('ADB command failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown error executing ADB command'
    }
  }
}

const exec = promisify(execCallback)

// Sleep helper function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const executeAdbApplicationReset = async (): Promise<AdbCommandResult> => {
  const adb = getAdbPath()

  try {
    // First command: Force stop
    const forceStopCommand = `${adb} shell am force-stop de.ubimax.frontline.client`
    logger.info('Force stopping application with ADB command:', forceStopCommand)

    try {
      await exec(forceStopCommand)
      logger.info('Force stop command completed successfully')
    } catch (error: any) {
      logger.error('Error executing force stop command:', error.message)
      return {
        success: false,
        error: error.message
      }
    }

    // Sleep for a specified time (e.g., 2000ms = 2 seconds)
    logger.info('Waiting for application to fully stop...')
    await sleep(2000)

    // Second command: Start application
    const startCommand = `${adb} shell am start -n de.ubimax.frontline.client/de.ubimax.android.client.XActivityLauncher`
    logger.info('Starting application with ADB command:', startCommand)

    try {
      const startResult = await exec(startCommand)
      logger.info('Start command completed successfully')

      return {
        success: true,
        output: startResult.stdout ? startResult.stdout.toString() : ''
      }
    } catch (error: any) {
      logger.error('Error executing start command:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  } catch (error: any) {
    logger.error('Application reset failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown error resetting application'
    }
  }
}
