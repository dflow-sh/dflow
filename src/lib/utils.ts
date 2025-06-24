import { type ClassValue, clsx } from 'clsx'
import crypto from 'crypto'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type DatabaseType = Exclude<
  z.infer<typeof createServiceSchema>['databaseType'],
  undefined
>

export function parseDatabaseInfo({
  stdout,
  dbType,
}: {
  stdout: string
  dbType: DatabaseType
}) {
  const lines = stdout.split('\n').map(line => line.trim())
  const data: {
    type: DatabaseType
    connectionUrl?: string
    username?: string
    password?: string
    host?: string
    port?: string
    status?: 'running' | 'missing' | 'exited'
    version?: string
    databaseName?: string
  } = { type: dbType }

  for (const line of lines) {
    if (line.startsWith('Dsn:')) {
      const dsn = line.split('Dsn:')[1].trim()
      data.connectionUrl = dsn

      switch (dbType) {
        case 'mongo': {
          const regex = /mongodb:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
          const match = dsn.match(regex)
          if (match) {
            data.username = match[1]
            data.password = match[2]
            data.host = match[3]
            data.port = match[4]
            data.databaseName = match[5]
          }
          break
        }

        case 'postgres': {
          const regex = /postgres:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
          const match = dsn.match(regex)
          if (match) {
            data.username = match[1]
            data.password = match[2]
            data.host = match[3]
            data.port = match[4]
            data.databaseName = match[5]
          }
          break
        }

        case 'mysql':
        case 'mariadb': {
          const regex = /mysql:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
          const match = dsn.match(regex)
          if (match) {
            data.username = match[1]
            data.password = match[2]
            data.host = match[3]
            data.port = match[4]
            data.databaseName = match[5]
          }
          break
        }

        case 'redis': {
          const regex = /redis:\/\/(.*?):(.*?)@(.*?):(.*)/
          const match = dsn.match(regex)
          if (match) {
            data.username = match[1]
            data.password = match[2]
            data.host = match[3]
            data.port = match[4]
          }
          break
        }

        default:
          console.warn('Unknown database type:', dbType)
      }
    } else if (line.startsWith('Status:')) {
      const status = line.split('Status:')[1].trim()
      if (status === 'running' || status === 'missing' || status === 'exited') {
        data.status = status
      }
    } else if (line.startsWith('Version:')) {
      data.version = line.split('Version:')[1].trim()
    }
  }

  return data
}

export function parseDatabaseUrl(url: string): {
  type: DatabaseType
  username?: string
  password?: string
  host?: string
  port?: string
  databaseName?: string
} {
  let dbType: DatabaseType

  if (url.startsWith('postgres://')) dbType = 'postgres'
  else if (url.startsWith('mongodb://')) dbType = 'mongo'
  else if (url.startsWith('mysql://')) dbType = 'mysql'
  else if (url.startsWith('mariadb://')) dbType = 'mariadb'
  else if (url.startsWith('redis://')) dbType = 'redis'
  else throw new Error('Unsupported or unrecognized database URL type.')

  const data: {
    type: DatabaseType
    username?: string
    password?: string
    host?: string
    port?: string
    databaseName?: string
  } = { type: dbType }

  switch (dbType) {
    case 'postgres': {
      const regex = /postgres:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
      const match = url.match(regex)
      if (match) {
        data.username = match[1]
        data.password = match[2]
        data.host = match[3]
        data.port = match[4]
        data.databaseName = match[5]
      }
      break
    }

    case 'mongo': {
      const regex = /mongodb:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
      const match = url.match(regex)
      if (match) {
        data.username = match[1]
        data.password = match[2]
        data.host = match[3]
        data.port = match[4]
        data.databaseName = match[5]
      }
      break
    }

    case 'mysql':
    case 'mariadb': {
      const regex = /.*:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
      const match = url.match(regex)
      if (match) {
        data.username = match[1]
        data.password = match[2]
        data.host = match[3]
        data.port = match[4]
        data.databaseName = match[5]
      }
      break
    }

    case 'redis': {
      // Redis doesn't usually include database names (uses DB index)
      // redis://username:password@host:port (optional username)
      const regex = /redis:\/\/(?:(.*?):(.*?)@)?(.*?):(.*)/
      const match = url.match(regex)
      if (match) {
        data.username = match[1]
        data.password = match[2]
        data.host = match[3]
        data.port = match[4]
        data.databaseName = '' // Not typically present
      }
      break
    }
  }

  return data
}

export function generateRandomString({
  length = 4,
  charset = '',
}: {
  length: number
  charset?: string
}) {
  const chars =
    charset || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const values = crypto.randomBytes(length)

  return Array.from(values)
    .map(v => chars.charAt(v % chars.length))
    .join('')
}
