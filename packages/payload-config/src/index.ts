// Export all collections
import Users from './collections/Users'
import Servers from './collections/Servers'
import Services from './collections/Services'
import Projects from './collections/Projects'
import Deployments from './collections/Deployments'
import SSHkeys from './collections/SSHkeys'
import SecurityGroups from './collections/SecurityGroups'
import Tenants from './collections/Tenants'
import Templates from './collections/Templates'
import Roles from './collections/Roles'
import Media from './collections/Media'
import GitProviders from './collections/GitProviders'
import CloudProviderAccounts from './collections/CloudProviderAccounts'
import DockerRegistries from './collections/DockerRegistries'
import Backups from './collections/Backups'
import Banners from './collections/Banners'
import Traefik from './collections/Traefik'

export const collections = [
  Users,
  Servers,
  Services,
  Projects,
  Deployments,
  SSHkeys,
  SecurityGroups,
  Tenants,
  Templates,
  Roles,
  Media,
  GitProviders,
  CloudProviderAccounts,
  DockerRegistries,
  Backups,
  Banners,
  Traefik,
]

// Export globals
import AuthConfig from './globals/AuthConfig'
import Branding from './globals/Branding'
import Theme from './globals/Theme'

export const globals = [
  AuthConfig,
  Branding,
  Theme,
]

// Export utilities
export * from './access'
export * from './fields'
export * from './endpoints'
