import { Deployment, DockerRegistry, GitProvider } from '@/payload-types'

export interface DatabaseDetails {
  type?: 'postgres' | 'mongo' | 'mysql' | 'redis' | 'mariadb' | null
  username?: string | null
  password?: string | null
  host?: string | null
  port?: string | null
  database?: string | null
  url?: string | null
  exposedPorts?: string[] | null
}

export interface gitSettings {
  repository: string
  branch: string
  gitToken?: string
  owner: string
  buildPath: string
  port?: number | null
}

export interface ServiceNode {
  id: string
  name: string
  displayName?: string
  description?: string | null
  type: 'database' | 'app' | 'docker'
  createdAt?: string
  databaseDetails?: DatabaseDetails
  builder?:
    | 'railpack'
    | 'nixpacks'
    | 'dockerfile'
    | 'herokuBuildPacks'
    | 'buildPacks'
    | null
  provider?: string | GitProvider | null
  providerType?:
    | 'github'
    | 'gitlab'
    | 'bitbucket'
    | 'azureDevOps'
    | 'gitea'
    | null
  githubSettings?: gitSettings
  azureSettings?: gitSettings
  giteaSettings?: gitSettings
  gitlabSettings?: gitSettings
  bitbucketSettings?: gitSettings
  dockerDetails?: {
    /**
     * Enter the docker-registry URL: ghrc://contentql/pin-bolt:latest
     */
    url?: string | null
    account?: (string | null) | DockerRegistry
    ports?:
      | {
          hostPort: number
          containerPort: number
          scheme: 'http' | 'https'
          id?: string | null
        }[]
      | null
  }
  variables?:
    | {
        key: string
        value: string
      }[]
    | null
  volumes?:
    | {
        hostPath: string
        containerPath: string
      }[]
    | null
  deployments?: {
    id: string
    status: Deployment['status']
  }[]
  disableNode?: boolean
}
