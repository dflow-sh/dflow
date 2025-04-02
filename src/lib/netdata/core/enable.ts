import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import { getVersion } from './getVersion'

/**
 * Enables the Netdata service on boot
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const enable = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Enabling Netdata...')

  // Check if netdata is installed
  const version = await getVersion({ ssh, options })
  if (!version) {
    return {
      success: false,
      message: 'Cannot enable Netdata: it is not installed.',
    }
  }

  // Enable and start the service
  const enableResult = await ssh.execCommand(
    'sudo systemctl enable netdata',
    options,
  )
  const startResult = await ssh.execCommand(
    'sudo systemctl start netdata',
    options,
  )

  // Verify service is running
  const statusCheck = await ssh.execCommand(
    'systemctl is-active netdata',
    options,
  )

  return {
    success: statusCheck.stdout.trim() === 'active',
    message:
      statusCheck.stdout.trim() === 'active'
        ? 'Netdata service enabled and started successfully'
        : 'Failed to enable Netdata service completely',
    enableOutput: enableResult.stdout,
    enableError: enableResult.stderr,
    startOutput: startResult.stdout,
    startError: startResult.stderr,
  }
}
