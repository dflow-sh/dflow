import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Checks if the Netdata service is currently restarting
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with boolean `isRestarting` status and output/error messages
 */
export const isRestarting = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Checking if Netdata is restarting...')

  // Check if Netdata is currently restarting
  const restartCheck = await ssh.execCommand(
    "systemctl show netdata --property=ActiveState,SubState | grep 'reloading\\|activating'",
    options,
  )

  return {
    isRestarting: restartCheck.stdout.trim() !== '',
    message:
      restartCheck.stdout.trim() !== ''
        ? 'Netdata is currently restarting.'
        : 'Netdata is not restarting.',
    output: restartCheck.stdout,
    error: restartCheck.stderr,
  }
}
