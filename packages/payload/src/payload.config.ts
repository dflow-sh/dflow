import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { resendAdapter } from '@payloadcms/email-resend'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { env } from '@dflow/config/env'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { autoLogin } from '@dflow/payload/endpoints/auto-login'
import { logs } from '@dflow/payload/endpoints/logs'
import { serverEvents } from '@dflow/payload/endpoints/server-events'

import { Backups } from './collections/Backups'
import { Banners } from './collections/Banners'
import { CloudProviderAccounts } from './collections/CloudProviderAccounts'
import { Deployments } from './collections/Deployments'
import { DockerRegistries } from './collections/DockerRegistries'
import { GitProviders } from './collections/GitProviders'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Roles } from './collections/Roles'
import { SSHKeys } from './collections/SSHkeys'
import SecurityGroups from './collections/SecurityGroups'
import { Servers } from './collections/Servers'
import { Services } from './collections/Services'
import { Template } from './collections/Templates'
import { Tenants } from './collections/Tenants'
import { Traefik } from './collections/Traefik'
import { Users } from './collections/Users'
import { logoutHandler } from './endpoints/logout'
import { AuthConfig } from './globals/AuthConfig'
import { Branding } from './globals/Branding'
import { Theme } from './globals/Theme'
import { checkServersConnectionsTask } from './jobs/checkServersConnections'
import { webhooksPlugin } from '@dflow/plugins/webhook'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  routes: {
    admin: '/payload-admin',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
      importMapFile: path.resolve(
        dirname,
        'app',
        '(payload)',
        'payload-admin',
        'importMap.js',
      ),
    },
  },
  globals: [Theme, Branding, AuthConfig],
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
    Tenants,
    Backups,
    Traefik,
    Roles,
    Banners,
    Media,
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
  plugins: [
    multiTenantPlugin({
      collections: {
        templates: {},
        gitProviders: {},
        servers: {},
        services: {},
        sshKeys: {},
        dockerRegistries: {},
        cloudProviderAccounts: {},
        securityGroups: {},
        projects: {},
        backups: {},
        roles: {},
      },
      userHasAccessToAllTenants: user => Boolean(user?.role?.includes('admin')),
      enabled: true,
      tenantsArrayField: {
        includeDefaultField: false,
      },
    }),
    webhooksPlugin,
  ],
  ...(env?.RESEND_API_KEY &&
    env?.RESEND_SENDER_EMAIL &&
    env?.RESEND_SENDER_NAME && {
      email: resendAdapter({
        defaultFromAddress: env.RESEND_SENDER_EMAIL,
        defaultFromName: env.RESEND_SENDER_NAME,
        apiKey: env.RESEND_API_KEY,
      }),
    }),
  endpoints: [
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
    {
      method: 'get',
      path: '/auto-login',
      handler: autoLogin,
    },
    {
      path: '/logout',
      method: 'post',
      handler: logoutHandler,
    },
    {
      path: '/logout',
      method: 'get',
      handler: logoutHandler,
    },
  ],
  jobs: {
    tasks: [checkServersConnectionsTask],
    access: {
      run: () => true,
    },
    autoRun: [
      {
        cron: '0/5 * * * *',
        limit: 10,
        queue: 'servers-ssh-connection-checks',
      },
    ],
    deleteJobOnComplete: false,
    shouldAutoRun: async () => {
      return true
    },
  },
})
