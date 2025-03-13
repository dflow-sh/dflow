import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import { checkInstalled } from './checkInstalled'

/**
 * Disables the Netdata service
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const disable = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Disabling Netdata...')

  // Check if netdata is installed
  const checkResult = await checkInstalled({ ssh, options })
  if (!checkResult.isInstalled) {
    return {
      success: true,
      message: 'Netdata is not installed, so it is already disabled.',
    }
  }

  // Stop and disable the service
  const stopResult = await ssh.execCommand(
    'sudo systemctl stop netdata',
    options,
  )
  const disableResult = await ssh.execCommand(
    'sudo systemctl disable netdata',
    options,
  )

  // Verify service is stopped
  const statusCheck = await ssh.execCommand(
    'systemctl is-active netdata',
    options,
  )

  return {
    success:
      statusCheck.stdout.trim() === 'inactive' ||
      statusCheck.stdout.trim() === 'unknown',
    message:
      statusCheck.stdout.trim() === 'inactive' ||
      statusCheck.stdout.trim() === 'unknown'
        ? 'Netdata service stopped and disabled successfully'
        : 'Failed to disable Netdata service completely',
    stopOutput: stopResult.stdout,
    stopError: stopResult.stderr,
    disableOutput: disableResult.stdout,
    disableError: disableResult.stderr,
  }
}
