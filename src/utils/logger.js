/**
 * Standardized Logger Utility
 * Supports multiple log levels with environment-based configuration
 * Logs to both console and file
 */

const fs = require('fs')
const path = require('path')

// Log levels with priorities (higher number = higher severity)
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
}

// Determine current log level from environment
const getCurrentLogLevel = () => {
    const envLevel = (process.env.LOG_LEVEL || 'info').toUpperCase()
    return LOG_LEVELS[envLevel] !== undefined ? LOG_LEVELS[envLevel] : LOG_LEVELS.INFO
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs')
const ensureLogsDirectory = () => {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
    }
}

// Get today's log file path
const getTodayLogFile = () => {
    const today = new Date().toISOString().split('T')[0]
    return path.join(logsDir, `${today}.log`)
}

const getTimestamp = () => {
    return new Date().toISOString()
}

const formatLog = (level, module, message, data = null) => {
    const timestamp = getTimestamp()
    const dataStr = data ? ` | ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] [${module}]${dataStr} - ${message}`
}

// Write log to file
const writeToFile = (formattedLog) => {
    if (process.env.LOG_FILE === 'true' || process.env.LOG_FILE === 'True') {
        try {
            ensureLogsDirectory()
            const logFile = getTodayLogFile()
            fs.appendFileSync(logFile, formattedLog + '\n', 'utf8')
        } catch (error) {
            console.error('Failed to write to log file:', error.message)
        }
    }
}

// Check if log should be printed based on current level
const shouldLog = (messageLevel) => {
    return messageLevel >= getCurrentLogLevel()
}

const logger = {
    debug: (module, message, data = null) => {
        if (shouldLog(LOG_LEVELS.DEBUG)) {
            const formatted = formatLog('DEBUG', module, message, data)
            console.log('\x1b[36m%s\x1b[0m', formatted) // Cyan color for debug
            writeToFile(formatted)
        }
    },
    info: (module, message, data = null) => {
        if (shouldLog(LOG_LEVELS.INFO)) {
            const formatted = formatLog('INFO', module, message, data)
            console.log('\x1b[32m%s\x1b[0m', formatted) // Green color for info
            writeToFile(formatted)
        }
    },
    warn: (module, message, data = null) => {
        if (shouldLog(LOG_LEVELS.WARN)) {
            const formatted = formatLog('WARN', module, message, data)
            console.warn('\x1b[33m%s\x1b[0m', formatted) // Yellow color for warn
            writeToFile(formatted)
        }
    },
    error: (module, message, data = null) => {
        if (shouldLog(LOG_LEVELS.ERROR)) {
            const formatted = formatLog('ERROR', module, message, data)
            console.error('\x1b[31m%s\x1b[0m', formatted) // Red color for error
            writeToFile(formatted)
        }
    }
}

// Initialize logs directory on module load
ensureLogsDirectory()

module.exports = logger
