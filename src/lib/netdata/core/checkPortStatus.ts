import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import { available } from '@/lib/server/ports/available'

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
  const portCheck = await available({ ssh, ports, options })

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
