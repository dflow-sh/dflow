import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { resendAdapter } from '@payloadcms/email-resend'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { env } from 'env'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { autoLogin } from '@dflow/payload-config/endpoints/auto-login'
import { logs } from '@dflow/payload-config/endpoints/logs'
import { serverEvents } from '@dflow/payload-config/endpoints/server-events'

import { Backups } from '@dflow/payload-config/collections/Backups'
import { Banners } from '@dflow/payload-config/collections/Banners'
import { CloudProviderAccounts } from '@dflow/payload-config/collections/CloudProviderAccounts'
import { Deployments } from '@dflow/payload-config/collections/Deployments'
import { DockerRegistries } from '@dflow/payload-config/collections/DockerRegistries'
import { GitProviders } from '@dflow/payload-config/collections/GitProviders'
import { Media } from '@dflow/payload-config/collections/Media'
import { Projects } from '@dflow/payload-config/collections/Projects'
import { Roles } from '@dflow/payload-config/collections/Roles'
import { SSHKeys } from '@dflow/payload-config/collections/SSHkeys'
import SecurityGroups from '@dflow/payload-config/collections/SecurityGroups'
import { Servers } from '@dflow/payload-config/collections/Servers'
import { Services } from '@dflow/payload-config/collections/Services'
import { Template } from '@dflow/payload-config/collections/Templates'
import { Tenants } from '@dflow/payload-config/collections/Tenants'
import { Traefik } from '@dflow/payload-config/collections/Traefik'
import { Users } from '@dflow/payload-config/collections/Users'
import { logoutHandler } from '@dflow/payload-config/endpoints/logout'
import { AuthConfig } from '@dflow/payload-config/globals/AuthConfig'
import { Branding } from '@dflow/payload-config/globals/Branding'
import { Theme } from '@dflow/payload-config/globals/Theme'
import { checkServersConnectionsTask } from '@dflow/payload-config/jobs/checkServersConnections'
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
