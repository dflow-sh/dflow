import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import checkDpkgLock from '@/lib/utils/checkDpkgLock'

import { getVersion } from './getVersion'

/**
 * Installs Netdata on the remote system using the official install script
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const install = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Installing Netdata...')

  // First check if netdata is already installed
  const version = await getVersion({ ssh, options })
  if (Boolean(version)) {
    return {
      success: true,
      message: `Netdata is already installed. Version: ${version || 'unknown'}`,
      alreadyInstalled: true,
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

  // Use the official one-line installer with minimal installation
  const installCommand =
    'wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh && sh /tmp/netdata-kickstart.sh --non-interactive'

  const installResult = await ssh.execCommand(installCommand, options)

  if (installResult.code === 0) {
    // Verify installation was successful
    const version = await getVersion({ ssh, options })

    return {
      success: Boolean(version),
      message: Boolean(version)
        ? `Netdata installed successfully. Version: ${version || 'unknown'}`
        : 'Installation script completed but Netdata not detected.',
      output: installResult.stdout,
      error: installResult.stderr,
    }
  } else {
    return {
      success: false,
      message: 'Failed to install Netdata',
      output: installResult.stdout,
      error: installResult.stderr,
    }
  }
}
