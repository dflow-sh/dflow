export interface DatabaseDetails {
  type?: 'postgres' | 'mongo' | 'mysql' | 'redis' | 'mariadb' | null
  username?: string | null
  password?: string | null
  host?: string | null
  port?: number | null
  database?: string | null
  url?: string | null
  exposedPorts?: string[] | null
}

export interface ServiceNode {
  id: string
  type: 'database' | 'app' | 'docker'
  createdAt: string
  databaseDetails?: DatabaseDetails
  environmentVariables:
    | string
    | Record<string, unknown>
    | { [key: string]: unknown }
    | unknown[]
}
