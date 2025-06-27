import { exec } from 'child_process'
import {
  NodeSSH,
  SSHExecCommandOptions,
  SSHExecCommandResponse,
} from 'node-ssh'
import { promisify } from 'util'

import { Project, Server } from '@/payload-types'

const execAsync = promisify(exec)

// SSH connection type
export type SSHConnectionType = {
  type: 'ssh'
  ip: string
  port: number
  username: string
  privateKey: string
}

// Tailscale connection type
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

// --- Main SSH/Tailscale Utility ---

export const dynamicSSH = async (params: SSHType) => {
  // Step 1: SSH connection
  if (params.type === 'ssh') {
    const { ip, port, privateKey, username } = params
    const ssh = new NodeSSH()
    await ssh.connect({
      host: ip,
      port,
      username,
      privateKey,
    })
    return {
      execCommand: (
        command: string,
        options: SSHExecCommandOptions = {},
      ): Promise<SSHExecCommandResponse> => ssh.execCommand(command, options),
      disconnect: () => ssh.dispose(),
      ssh,
    }
  }

  // Step 2: Tailscale connection (no persistent connection)
  const { hostname, username } = params
  return {
    execCommand: async (
      command: string,
      _options: SSHExecCommandOptions = {},
    ): Promise<SSHExecCommandResponse> => {
      const target = `${username}@${hostname}`
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
        return {
          stdout: error.stdout || '',
          stderr: error.stderr || error.message || '',
          code: error.code || 1,
          signal: null,
        }
      }
    },
    disconnect: async () => {}, // nothing to disconnect
    ssh: null,
  }
}

// --- Extract SSH Details Utility ---

export const extractSSHDetails = ({
  project,
  server,
}: ExtractSSHDetails): SSHType => {
  let serverData: Server | undefined

  // Step 1: Get server data from project or server
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

  // Step 2: SSH connection details
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
  }

  // Step 3: Tailscale connection details
  if (serverData.preferConnectionType === 'tailscale') {
    if (!serverData.hostname) {
      throw new Error('Hostname is required for Tailscale connection type')
    }
    return {
      type: 'tailscale',
      hostname: serverData.hostname,
      username: serverData.username,
    }
  }

  throw new Error('Invalid connection type')
}
