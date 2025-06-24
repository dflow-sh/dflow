import { NodeSSH } from 'node-ssh'

import { Project, Server } from '@/payload-types'

export type SSHType =
  | {
      ip: string
      port: number
      username: string
      privateKey: string
    }
  | {
      hostname: string
      username: string
    }

type ExtractSSHDetails =
  | { project: Project | string; server?: never }
  | { project?: never; server: Server | string }

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
    const { ip, port, username, sshKey } = project?.server

    if (typeof sshKey === 'string') {
      throw new Error('SSH details missing')
    }

    return {
      ip,
      port,
      username,
      privateKey: sshKey.privateKey,
    }
  } else if (server && typeof server === 'object') {
    const { ip, port, username, sshKey } = server

    if (typeof sshKey === 'string') {
      throw new Error('SSH details missing')
    }

    return {
      ip,
      port,
      username,
      privateKey: sshKey.privateKey,
    }
  }

  throw new Error(
    'Please provide proper details to extract server connection details',
  )
}

export const dynamicSSH = async (params: SSHType) => {
  const ssh = new NodeSSH()

  if ('ip' in params) {
    const { ip, port, privateKey, username } = params

    await ssh.connect({
      host: ip,
      port,
      username,
      privateKey,
    })
  } else {
    const { hostname, username } = params

    await ssh.connect({
      host: hostname,
      username,
    })
  }

  return ssh
}
