import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Reloads the Netdata service configuration
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const reload = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Reloading Netdata...')

  // Reload the configuration
  const reloadResult = await ssh.execCommand(
    'sudo systemctl reload netdata',
    options,
  )

  return {
    success: reloadResult.stderr.trim() === '',
    message:
      reloadResult.stderr.trim() === ''
        ? 'Netdata reloaded successfully'
        : 'Failed to reload Netdata',
    reloadOutput: reloadResult.stdout,
    reloadError: reloadResult.stderr,
  }
}
