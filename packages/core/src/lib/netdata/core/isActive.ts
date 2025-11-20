import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Checks if the Netdata service is currently running
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with boolean `isActive` status and output/error messages
 */
export const isActive = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Checking if Netdata is active...')

  // Check if Netdata is active (running)
  const activeCheck = await ssh.execCommand(
    'systemctl is-active netdata',
    options,
  )

  return {
    isActive: activeCheck.stdout.trim() === 'active',
    message:
      activeCheck.stdout.trim() === 'active'
        ? 'Netdata is running.'
        : 'Netdata is not running.',
    output: activeCheck.stdout,
    error: activeCheck.stderr,
  }
}
