import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Disables the Netdata service from starting on boot
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

  // Disable and stop the service
  const disableResult = await ssh.execCommand(
    'sudo systemctl disable netdata',
    options,
  )
  const stopResult = await ssh.execCommand(
    'sudo systemctl stop netdata',
    options,
  )

  // Verify if service is disabled
  const isEnabledResult = await ssh.execCommand(
    'systemctl is-enabled netdata',
    options,
  )

  return {
    success: isEnabledResult.stdout.trim() !== 'enabled',
    message:
      isEnabledResult.stdout.trim() !== 'enabled'
        ? 'Netdata disabled successfully'
        : 'Failed to disable Netdata',
    disableOutput: disableResult.stdout,
    disableError: disableResult.stderr,
    stopOutput: stopResult.stdout,
    stopError: stopResult.stderr,
  }
}
