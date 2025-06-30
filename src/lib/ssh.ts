import { NodeSSH } from 'node-ssh'

import { Project, Server } from '@/payload-types'

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
  const ssh = new NodeSSH()

  // Step 1: SSH connection
  if (params.type === 'ssh') {
    const { ip, port, privateKey, username } = params
    await ssh.connect({
      host: ip,
      port,
      username,
      privateKey,
    })
  } else if (params.type === 'tailscale') {
    const { username, hostname } = params

    await ssh.connect({
      host: hostname,
      username,
    })

    console.log('connected via tailscale')
  }

  return ssh
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
