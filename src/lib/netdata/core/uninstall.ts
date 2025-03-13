import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import { checkInstalled } from './checkInstalled'

/**
 * Uninstalls Netdata from the remote system
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
  const checkResult = await checkInstalled({ ssh, options })
  if (!checkResult.isInstalled) {
    return {
      success: true,
      message: 'Netdata is not installed.',
      alreadyUninstalled: true,
    }
  }

  // Use the official uninstaller script
  const uninstallCommand = 'sudo netdata-uninstaller.sh --yes --force'

  const uninstallResult = await ssh.execCommand(uninstallCommand, options)

  // Verify uninstallation was successful
  const postCheck = await checkInstalled({ ssh, options })

  if (!postCheck.isInstalled) {
    return {
      success: true,
      message: 'Netdata uninstalled successfully.',
      output: uninstallResult.stdout,
      error: uninstallResult.stderr,
    }
  } else {
    // If regular uninstall failed, try the more aggressive approach
    console.log('Standard uninstall failed, trying alternate method...')

    // Find and run the uninstaller directly from the install directory
    const findUninstallerCommand =
      'find /opt/netdata -name netdata-uninstaller.sh 2>/dev/null || find /usr/libexec/netdata -name netdata-uninstaller.sh 2>/dev/null'
    const findResult = await ssh.execCommand(findUninstallerCommand, options)

    if (findResult.stdout.trim()) {
      const forcefulUninstall = await ssh.execCommand(
        `sudo ${findResult.stdout.trim()} --yes --force`,
        options,
      )

      // Check again
      const finalCheck = await checkInstalled({ ssh, options })

      return {
        success: !finalCheck.isInstalled,
        message: !finalCheck.isInstalled
          ? 'Netdata uninstalled successfully with alternate method.'
          : 'Failed to uninstall Netdata completely.',
        output: forcefulUninstall.stdout,
        error: forcefulUninstall.stderr,
      }
    }

    return {
      success: false,
      message: 'Failed to uninstall Netdata',
      output: uninstallResult.stdout,
      error: uninstallResult.stderr,
    }
  }
}
