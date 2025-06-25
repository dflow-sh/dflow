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

export type SSHType = {
  ip: string
  port: number
  username: string
  hostname?: string | null
  privateKey: string
}

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
    const shouldUseTailscale = config.hostname

    console.log(shouldUseTailscale, config)

    if (shouldUseTailscale) {
      this.useTailscale = true
      this.tailscaleConfig = {
        host: config.hostname!,
        username: config.username || 'root',
      }

      // Test Tailscale connection - if it fails, fall back to regular SSH
      try {
        const result = await this.execCommand('echo "tailscale-test"')
        if (result.code === 0) {
          return this
        } else {
          // Tailscale failed, fall back to regular SSH
          console.warn('Tailscale SSH test failed, falling back to regular SSH')

          this.useTailscale = false
          this.tailscaleConfig = null

          return await super.connect(config)
        }
      } catch (error) {
        // Tailscale failed, fall back to regular SSH without throwing
        console.warn(
          'Tailscale SSH connection failed, falling back to regular SSH:',
          (error as Error).message,
        )

        this.useTailscale = false
        this.tailscaleConfig = null

        const { hostname, ...extractedConfig } = config
        return await super.connect(extractedConfig)
      }
    } else {
      // Use original node-ssh for regular SSH connections
      return await super.connect(config)
    }
  }

  async execCommand(
    command: string,
    options: SSHExecCommandOptions = {},
  ): Promise<SSHExecCommandResponse> {
    if (this.useTailscale && this.tailscaleConfig) {
      // Use Tailscale SSH
      const { host, username } = this.tailscaleConfig
      const target = username ? `${username}@${host}` : host
      const tailscaleCommand = `tailscale ssh ${target} "${command.replace(/"/g, '\\"')}"`

      try {
        const { stdout, stderr } = await execAsync(tailscaleCommand, {
          maxBuffer: 1024 * 1024 * 10,
        })

        return {
          stdout: stdout || '',
          stderr: stderr || '',
          code: 0,
          signal: null,
        }
      } catch (error: any) {
        // If Tailscale command fails, fall back to regular SSH
        console.warn(
          'Tailscale SSH command failed, attempting fallback to regular SSH',
        )

        this.useTailscale = false

        try {
          // Try to reconnect with regular SSH using the stored config
          const config = {
            host: this.tailscaleConfig.host,
            username: this.tailscaleConfig.username,
          }

          await super.connect(config)
          this.tailscaleConfig = null

          // Retry the command with regular SSH
          return await super.execCommand(command, options)
        } catch (fallbackError) {
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
      return await super.execCommand(command, options)
    }
  }

  // Keep all other node-ssh methods intact
  // putFile, getFile, etc. will use the original implementation
}

export const dynamicSSH = async (params: SSHType) => {
  const ssh = new NodeSSH()

  const { ip, port, privateKey, username, hostname } = params

  await ssh.connect({
    host: ip,
    port,
    username,
    privateKey,
    hostname,
  })

  return ssh
}

// common utility function to extract ssh details
export const extractSSHDetails = ({ project, server }: ExtractSSHDetails) => {
  // todo: handle both ssh, tailscale connection case
  // 1. handle ssh case
  // 2. handle tailscale case

  if (
    project &&
    typeof project === 'object' &&
    typeof project?.server === 'object'
  ) {
    const { ip, port, username, sshKey, hostname } = project?.server

    if (typeof sshKey === 'string') {
      throw new Error('SSH details missing')
    }

    return {
      ip,
      port,
      username,
      privateKey: sshKey.privateKey,
      hostname,
    }
  } else if (server && typeof server === 'object') {
    const { ip, port, username, sshKey, hostname } = server

    if (typeof sshKey === 'string') {
      throw new Error('SSH details missing')
    }

    return {
      ip,
      port,
      username,
      privateKey: sshKey.privateKey,
      hostname,
    }
  }

  throw new Error(
    'Please provide proper details to extract server connection details',
  )
}
