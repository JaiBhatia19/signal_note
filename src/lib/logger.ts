type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
}

class Logger {
  private logLevel: LogLevel

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, userId } = entry
    let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    if (userId) log += ` | User: ${userId}`
    if (context && Object.keys(context).length > 0) {
      log += ` | Context: ${JSON.stringify(context)}`
    }
    
    return log
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId
    }

    const formattedLog = this.formatLog(entry)

    switch (level) {
      case 'debug':
        console.debug(formattedLog)
        break
      case 'info':
        console.info(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'error':
        console.error(formattedLog)
        break
    }

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      this.sendToExternalService(entry)
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    // Implement external logging service integration here
    // e.g., Sentry, LogRocket, etc.
  }

  debug(message: string, context?: Record<string, any>, userId?: string) {
    this.log('debug', message, context, userId)
  }

  info(message: string, context?: Record<string, any>, userId?: string) {
    this.log('info', message, context, userId)
  }

  warn(message: string, context?: Record<string, any>, userId?: string) {
    this.log('warn', message, context, userId)
  }

  error(message: string, context?: Record<string, any>, userId?: string) {
    this.log('error', message, context, userId)
  }
}

export const logger = new Logger() 