import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import { checkInstalled } from './checkInstalled'

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
  const checkResult = await checkInstalled({ ssh, options })
  if (checkResult.isInstalled) {
    return {
      success: true,
      message: `Netdata is already installed. Version: ${checkResult.version || 'unknown'}`,
      alreadyInstalled: true,
    }
  }

  // Use the official one-line installer with minimal installation
  const installCommand =
    'bash <(curl -Ss https://my-netdata.io/kickstart.sh) --non-interactive'

  const installResult = await ssh.execCommand(installCommand, options)

  if (installResult.code === 0) {
    // Verify installation was successful
    const postCheck = await checkInstalled({ ssh, options })

    return {
      success: postCheck.isInstalled,
      message: postCheck.isInstalled
        ? `Netdata installed successfully. Version: ${postCheck.version || 'unknown'}`
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
