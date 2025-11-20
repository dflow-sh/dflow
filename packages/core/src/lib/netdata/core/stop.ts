import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Stops the Netdata service
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const stop = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Stopping Netdata...')

  // Stop the Netdata service
  const stopResult = await ssh.execCommand(
    'sudo systemctl stop netdata',
    options,
  )

  // Verify if the service is stopped
  const statusCheck = await ssh.execCommand(
    'systemctl is-active netdata',
    options,
  )

  return {
    success: statusCheck.stdout.trim() !== 'active',
    message:
      statusCheck.stdout.trim() !== 'active'
        ? 'Netdata stopped successfully'
        : 'Failed to stop Netdata',
    stopOutput: stopResult.stdout,
    stopError: stopResult.stderr,
  }
}
