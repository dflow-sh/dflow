import { NodeSSH, SSHExecOptions } from 'node-ssh'

export interface WettyConfig {
  sshHost?: string
  sshPort?: number
  sshUser?: string
  sshAuth?: 'password' | 'publickey'
  sshKey?: string
  base?: string
  port?: number
  title?: string
  bypassHelmet?: boolean
}

export const startWettyWithConfig = async (
  ssh: NodeSSH,
  config: WettyConfig,
  options?: SSHExecOptions,
) => {
  // Build command with all provided configuration options
  let command = 'docker run --rm'

  // Add port mapping
  const port = config.port || 3000
  command += ` -p ${port}:3000`

  // Add image name
  command += ' wettyoss/wetty'

  // Add all config options
  if (config.sshHost) command += ` --ssh-host=${config.sshHost}`
  if (config.sshPort) command += ` --ssh-port=${config.sshPort}`
  if (config.sshUser) command += ` --ssh-user=${config.sshUser}`
  if (config.sshAuth) command += ` --ssh-auth=${config.sshAuth}`
  if (config.sshKey) command += ` --ssh-key=${config.sshKey}`
  if (config.base) command += ` --base=${config.base}`
  if (config.title) command += ` --title="${config.title}"`
  if (config.bypassHelmet) command += ` --bypass-helmet`

  const result = await ssh.execCommand(command, options)

  if (result.code === 1) {
    throw new Error(result.stderr)
  }

  return result
}
