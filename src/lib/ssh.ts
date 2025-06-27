import { exec } from 'child_process'
import {
  Config,
  NodeSSH as OriginalNodeSSH,
  SSHExecCommandOptions,
  SSHExecCommandResponse,
} from 'node-ssh'
import { promisify } from 'util'

import { Project, Server } from '@/payload-types'

const execAsync = promisify(exec)

interface TailscaleConfig {
  host: string
  username: string
}

// SSH connection type - requires IP, port, username, and private key
export type SSHConnectionType = {
  type: 'ssh'
  ip: string
  port: number
  username: string
  privateKey: string
}

// Tailscale connection type - requires hostname and username only
export type TailscaleConnectionType = {
  type: 'tailscale'
  hostname: string
  username: string
}

// Union type for both connection types
export type SSHType = SSHConnectionType | TailscaleConnectionType

type ExtractSSHDetails =
  | { project: Project | string; server?: never }
  | { project?: never; server: Server | string }

interface ExtendedConfig extends Config {
  tailscale?: boolean
  hostname?: string | null
}

export class NodeSSH extends OriginalNodeSSH {
  private useTailscale: boolean = false
  private tailscaleConfig: TailscaleConfig | null = null

  constructor() {
    super()
  }

  async connect(config: ExtendedConfig): Promise<this> {
    // Detect if we should use Tailscale
    const shouldUseTailscale = Boolean(config.hostname)

    if (shouldUseTailscale) {
      this.useTailscale = true
      this.tailscaleConfig = {
        host: config.hostname!,
        username: config.username || 'root',
      }

      // Test Tailscale connection - if it fails, fall back to regular SSH
      const result = await this.execCommand('echo "tailscale-test"')

      if (result.code === 0) {
        console.log('connected with tailscale ssh')
        return this
      } else {
        // Tailscale failed, fall back to regular SSH
        console.warn('Tailscale SSH failed, retrying with NodeSSH')

        this.useTailscale = false
        this.tailscaleConfig = null

        const { hostname, ...extractedConfig } = config
        return await super.connect(extractedConfig)
      }
    } else {
      // Use original node-ssh for regular SSH connections
      const { hostname, ...extractedConfig } = config
      return await super.connect(extractedConfig)
    }
  }

  async execCommand(
    command: string,
    options: SSHExecCommandOptions = {},
  ): Promise<SSHExecCommandResponse> {
    // Executing ssh commands via SSH
    if (this.useTailscale && this.tailscaleConfig) {
      const { host, username } = this.tailscaleConfig
      const target = username ? `${username}@${host}` : host

      const tailscaleCommand = `ssh -o StrictHostKeyChecking=no ${target} "${command.replace(/"/g, '\\"')}"`

      // executing with tailscale prefix
      try {
        const { stdout, stderr } = await execAsync(
          `tailscale ${tailscaleCommand}`,
          {
            maxBuffer: 1024 * 1024 * 10,
          },
        )

        return {
          stdout: stdout || '',
          stderr: stderr || '',
          code: 0,
          signal: null,
        }
      } catch (error: any) {
        // If Tailscale command fails, fall back to regular SSH
        console.warn(
          `Failed to execute SSH via 'tailscale ssh ${username}@${host}'`,
        )

        try {
          // Try to reconnect via tailscale config, but without tailscale prefix
          console.log(
            `connecting to SSH via tailscale, but without tailscale prefix`,
          )

          // const { stdout, stderr } = await execAsync(tailscaleCommand, {
          //   maxBuffer: 1024 * 1024 * 10,
          // })

          // return {
          //   stdout: stdout || '',
          //   stderr: stderr || '',
          //   code: 0,
          //   signal: null,
          // }

          // // Retry the command with regular SSH
          return await super.execCommand(command, options)
        } catch (fallbackError) {
          this.useTailscale = false
          console.log('Failed to execute SSH via tailscale without prefix')

          // If fallback also fails, return the original Tailscale error format
          return {
            stdout: error.stdout || '',
            stderr: error.stderr || error.message || '',
            code: error.code || 1,
            signal: null,
          }
        }
      }
    } else {
      // Use original node-ssh method
      console.log('connecting with pure ssh with key value pair')
      return await super.execCommand(command, options)
    }
  }

  async isConnectedViaTailnet() {
    const result = await this.execCommand('echo "tailscale-test"')
    return result.code === 0
  }

  // Keep all other node-ssh methods intact
  // putFile, getFile, etc. will use the original implementation
}

export const dynamicSSH = async (params: SSHType) => {
  const ssh = new NodeSSH()

  if (params.type === 'ssh') {
    const { ip, port, privateKey, username } = params
    await ssh.connect({
      host: ip,
      port,
      username,
      privateKey,
    })
  } else {
    // Tailscale connection
    const { hostname, username } = params
    await ssh.connect({
      host: hostname, // Use hostname as host for Tailscale
      username,
      hostname, // Pass hostname for Tailscale detection
    })
  }

  return ssh
}

// common utility function to extract ssh details
export const extractSSHDetails = ({
  project,
  server,
}: ExtractSSHDetails): SSHType => {
  let serverData: Server | undefined
  if (
    project &&
    typeof project === 'object' &&
    typeof project?.server === 'object'
  ) {
    serverData = project.server as Server
  } else if (server && typeof server === 'object') {
    serverData = server as Server
  }

  if (!serverData) {
    throw new Error('No server data found')
  }

  if (serverData.preferConnectionType === 'ssh') {
    if (!serverData.sshKey || typeof serverData.sshKey === 'string') {
      throw new Error('SSH key is required for SSH connection type')
    }
    if (!serverData.ip || !serverData.port) {
      throw new Error('IP and port are required for SSH connection type')
    }
    return {
      type: 'ssh',
      ip: serverData.ip,
      port: serverData.port,
      username: serverData.username,
      privateKey: serverData.sshKey.privateKey,
    }
  } else if (serverData.preferConnectionType === 'tailscale') {
    if (!serverData.hostname) {
      throw new Error('Hostname is required for Tailscale connection type')
    }
    return {
      type: 'tailscale',
      hostname: serverData.hostname,
      username: serverData.username,
    }
  } else {
    throw new Error('Invalid connection type')
  }
}
