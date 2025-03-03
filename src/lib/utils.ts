import { type ClassValue, clsx } from 'clsx'
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
