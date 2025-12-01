import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Checks if the Netdata service is enabled on boot
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with boolean `isEnabled` status and output/error messages
 */
export const isEnabled = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Checking if Netdata is enabled on boot...')

  // Check if Netdata is enabled
  const enableCheck = await ssh.execCommand(
    'systemctl is-enabled netdata',
    options,
  )

  return {
    isEnabled: enableCheck.stdout.trim() === 'enabled',
    message:
      enableCheck.stdout.trim() === 'enabled'
        ? 'Netdata is enabled on boot.'
        : 'Netdata is not enabled on boot.',
    output: enableCheck.stdout,
    error: enableCheck.stderr,
  }
}
