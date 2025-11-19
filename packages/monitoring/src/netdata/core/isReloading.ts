import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Checks if the Netdata service is currently reloading
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with boolean `isReloading` status and output/error messages
 */
export const isReloading = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Checking if Netdata is reloading...')

  // Check if Netdata is currently reloading
  const reloadCheck = await ssh.execCommand(
    "systemctl show netdata --property=ActiveState,SubState | grep 'reloading'",
    options,
  )

  return {
    isReloading: reloadCheck.stdout.trim() !== '',
    message:
      reloadCheck.stdout.trim() !== ''
        ? 'Netdata is currently reloading.'
        : 'Netdata is not reloading.',
    output: reloadCheck.stdout,
    error: reloadCheck.stderr,
  }
}
