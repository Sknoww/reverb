// src/main/adbUtils.ts
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const executeAdbCommand = async (command: string): Promise<string> => {
  try {
    const { stdout } = await execAsync(`adb ${command}`)
    return stdout
  } catch (error) {
    console.error('ADB command failed:', error)
    throw error
  }
}
