import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { createLogger, format, Logger, transports } from 'winston'

// Create logs directory if it doesn't exist
const logsDir: string = path.join(app.getPath('userData'), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Generate a unique filename based on timestamp
const timestamp: string = new Date().toISOString().replace(/:/g, '-')
const logFilePath: string = path.join(logsDir, `app-${timestamp}.log`)

// Interface for additional metadata you might log
interface LogMetadata {
  [key: string]: any
}

// Create and configure the logger
const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    // Console transport
    new transports.Console(),
    // File transport with the unique filename
    new transports.File({ filename: logFilePath })
  ]
})

// Create a function to get the logger
export const getLogger = (): Logger => {
  return logger
}

// Optional: Extend the logger with custom methods if needed
export interface CustomLogger extends Logger {
  logAppEvent(eventName: string, metadata?: LogMetadata): void
}

// Implement the custom logger
export const customLogger: CustomLogger = logger as CustomLogger

customLogger.logAppEvent = (eventName: string, metadata?: LogMetadata): void => {
  logger.info(eventName, { ...metadata, eventType: 'AppEvent' })
}

// Export both standard and custom loggers
export default logger
