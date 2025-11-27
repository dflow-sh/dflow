import { keys as env } from '@core/keys'
import { Logger } from '@logtail/next'
import pino from 'pino'
import pretty from 'pino-pretty'

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const hasBetterStackToken = Boolean(env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN)

const betterStackLogger = hasBetterStackToken
  ? new Logger({
      source: env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    })
  : null

const stream =
  isDev || !hasBetterStackToken
    ? pretty({
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      })
    : undefined

const targets =
  isDev || !hasBetterStackToken
    ? undefined
    : [
        {
          target: 'pino/file',
          options: { destination: 1 },
          level: 'info',
        },
      ]

const logger = pino(
  {
    level: isDev ? 'debug' : 'info',
    transport: targets
      ? {
          targets,
        }
      : undefined,
    redact: {
      paths: ['userId'],
      remove: true,
    },
  },
  stream,
)

const createLogMethod = (level: 'debug' | 'info' | 'warn' | 'error') => {
  return (
    message: string,
    data?: any,
    options?: { hideInConsole?: boolean },
  ) => {
    const shouldShowConsole = isDev
      ? !options?.hideInConsole
      : !hasBetterStackToken
        ? !options?.hideInConsole
        : options?.hideInConsole === false

    if (shouldShowConsole) {
      logger[level](data, message)
    }

    if (betterStackLogger) {
      betterStackLogger[level](message, data)
    }
  }
}

export const log = {
  debug: createLogMethod('debug'),
  info: createLogMethod('info'),
  warn: createLogMethod('warn'),
  error: createLogMethod('error'),
}
