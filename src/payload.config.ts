import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { env } from 'env'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Backups } from './payload/collections/Backups'
import { CloudProviderAccounts } from './payload/collections/CloudProviderAccounts'
import { Deployments } from './payload/collections/Deployments'
import { DockerRegistries } from './payload/collections/DockerRegistries'
import { GitProviders } from './payload/collections/GitProviders'
import { Projects } from './payload/collections/Projects'
import { SSHKeys } from './payload/collections/SSHkeys'
import SecurityGroups from './payload/collections/SecurityGroups'
import { Servers } from './payload/collections/Servers'
import { Services } from './payload/collections/Services'
import { Template } from './payload/collections/Templates'
import { Users } from './payload/collections/Users'
import { databaseUpdate } from './payload/endpoints/databaseUpdate/index'
import { logs } from './payload/endpoints/logs'
import { serverEvents } from './payload/endpoints/server-events'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Projects,
    Services,
    Servers,
    SSHKeys,
    GitProviders,
    Deployments,
    CloudProviderAccounts,
    Template,
    SecurityGroups,
    DockerRegistries,
    Backups,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: env.DATABASE_URI,
  }),
  sharp,
  plugins: [],
  endpoints: [
    {
      method: 'post',
      path: '/databaseUpdate',
      handler: databaseUpdate,
    },
    {
      method: 'get',
      path: '/logs',
      handler: logs,
    },
    {
      method: 'get',
      path: '/server-events',
      handler: serverEvents,
    },
  ],
})
