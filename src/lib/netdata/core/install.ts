import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

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
  const dpkgLockCheck = await ssh.execCommand(
    'lsof /var/lib/dpkg/lock-frontend',
    options,
  )

  if (dpkgLockCheck.code === 0) {
    return {
      success: false,
      message:
        'dpkg is currently locked. Please wait for any ongoing package operations to complete.',
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
