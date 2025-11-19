import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import checkDpkgLock from '@/lib/utils/checkDpkgLock'

import { getVersion } from './getVersion'

/**
 * Uninstalls Netdata completely from the remote system
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const uninstall = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Uninstalling Netdata...')

  // First check if netdata is installed
  const version = await getVersion({ ssh, options })
  if (!version) {
    return {
      success: true,
      message: 'Netdata is not installed.',
      alreadyUninstalled: true,
    }
  }

  // Check if dpkg is locked before proceeding
  try {
    await checkDpkgLock(ssh, options) // returns exec result if not locked
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err),
      error: 'dpkg lock detected',
    }
  }

  // Stop and disable Netdata service
  const stopServiceCommands = [
    'sudo systemctl stop netdata || true',
    'sudo systemctl disable netdata || true',
    'sudo systemctl reset-failed || true',
    'sudo systemctl daemon-reexec || true',
    'sudo systemctl daemon-reload || true',
    'sudo systemctl unmask netdata || true',
    'sudo pkill -9 netdata || true',
  ].join(' && ')

  await ssh.execCommand(stopServiceCommands, options)

  // Use the official uninstall script
  const uninstallCommand =
    'wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh && sh /tmp/netdata-kickstart.sh --uninstall --non-interactive'

  const uninstallResult = await ssh.execCommand(uninstallCommand, options)

  // Force remove any remaining files and services
  const cleanupCommand = [
    'sudo rm -rf /etc/netdata /var/lib/netdata /var/log/netdata /usr/sbin/netdata /opt/netdata',
    'sudo rm -f /etc/systemd/system/netdata.service',
    'sudo rm -f /lib/systemd/system/netdata.service',
    'sudo rm -f /etc/init.d/netdata',
    'sudo systemctl daemon-reload',
    'sudo systemctl reset-failed',
  ].join(' && ')

  await ssh.execCommand(cleanupCommand, options)

  // Verify uninstallation was successful
  const postCheck = await getVersion({ ssh, options })

  return {
    success: !postCheck,
    message: !postCheck
      ? 'Netdata fully uninstalled.'
      : 'Failed to remove Netdata completely.',
    output: uninstallResult.stdout,
    error: uninstallResult.stderr,
  }
}
