import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

/**
 * Checks if Netdata is installed on the remote system
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with isInstalled status and version if available
 */
export const checkInstalled = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  // Check if the netdata service exists
  const serviceCheck = await ssh.execCommand(
    'systemctl list-unit-files | grep netdata',
    options,
  )

  // Check if netdata binary exists
  const binaryCheck = await ssh.execCommand('which netdata', options)

  // Get version if installed
  const versionCheck = await ssh.execCommand(
    'netdata -v 2>/dev/null || echo ""',
    options,
  )

  const isInstalled =
    serviceCheck.stdout.includes('netdata') || binaryCheck.code === 0

  return {
    isInstalled,
    version: versionCheck.stdout.trim() || null,
    servicePath: serviceCheck.stdout.trim() || null,
  }
}
