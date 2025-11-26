import path from 'path'
import { fileURLToPath } from 'url'
import { keys as env } from '@core/keys'
import { autoLogin } from '@core/payload/endpoints/auto-login'
import { logs } from '@core/payload/endpoints/logs'
import { serverEvents } from '@core/payload/endpoints/server-events'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { resendAdapter } from '@payloadcms/email-resend'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Backups } from "@core/payload/collections/Backups"
import { Banners } from "@core/payload/collections/Banners"
import { CloudProviderAccounts } from "@core/payload/collections/CloudProviderAccounts"
import { Deployments } from "@core/payload/collections/Deployments"
import { DockerRegistries } from "@core/payload/collections/DockerRegistries"
import { GitProviders } from "@core/payload/collections/GitProviders"
import { Media } from "@core/payload/collections/Media"
import { Projects } from "@core/payload/collections/Projects"
import { Roles } from "@core/payload/collections/Roles"
import SecurityGroups from "@core/payload/collections/SecurityGroups"
import { Servers } from "@core/payload/collections/Servers"
import { Services } from "@core/payload/collections/Services"
import { SSHKeys } from "@core/payload/collections/SSHkeys"
import { Template } from "@core/payload/collections/Templates"
import { Tenants } from "@core/payload/collections/Tenants"
import { Traefik } from "@core/payload/collections/Traefik"
import { Users } from "@core/payload/collections/Users"
import { logoutHandler } from "@core/payload/endpoints/logout"
import { AuthConfig } from "@core/payload/globals/AuthConfig"
import { Branding } from "@core/payload/globals/Branding"
import { Theme } from "@core/payload/globals/Theme"
import { checkServersConnectionsTask } from "@core/payload/jobs/checkServersConnections"
import { webhooksPlugin } from "@core/plugins/webhook"

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
