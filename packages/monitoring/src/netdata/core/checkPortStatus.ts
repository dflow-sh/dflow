import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import { status } from '@/lib/server/ports/status'

/**
 * Checks Netdata port status
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with port status and additional information
 */
export const checkPortStatus = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  // Netdata typically uses port 19999
  const ports = ['19999']

  // Use the available function from the imports to check port status
  const portCheck = await status({ ssh, ports, options })

  // Check if the service is running
  const serviceStatus = await ssh.execCommand(
    'systemctl is-active netdata',
    options,
  )

  return {
    portStatus: portCheck,
    serviceActive: serviceStatus.stdout.trim() === 'active',
    serviceStatus: serviceStatus.stdout.trim(),
  }
}
