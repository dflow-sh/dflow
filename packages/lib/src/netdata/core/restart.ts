import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Restarts the Netdata service
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const restart = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Restarting Netdata...')

  // Restart Netdata service
  const restartResult = await ssh.execCommand(
    'sudo systemctl restart netdata',
    options,
  )

  // Verify if service is running
  const statusCheck = await ssh.execCommand(
    'systemctl is-active netdata',
    options,
  )

  return {
    success: statusCheck.stdout.trim() === 'active',
    message:
      statusCheck.stdout.trim() === 'active'
        ? 'Netdata restarted successfully'
        : 'Failed to restart Netdata',
    restartOutput: restartResult.stdout,
    restartError: restartResult.stderr,
  }
}
