import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Starts the Netdata service
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const start = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Starting Netdata...')

  // Start the Netdata service
  const startResult = await ssh.execCommand(
    'sudo systemctl start netdata',
    options,
  )

  // Verify if the service is running
  const statusCheck = await ssh.execCommand(
    'systemctl is-active netdata',
    options,
  )

  return {
    success: statusCheck.stdout.trim() === 'active',
    message:
      statusCheck.stdout.trim() === 'active'
        ? 'Netdata started successfully'
        : 'Failed to start Netdata',
    startOutput: startResult.stdout,
    startError: startResult.stderr,
  }
}
