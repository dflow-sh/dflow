import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import { checkInstalled } from './checkInstalled'

/**
 * Disables the Netdata API by restricting access
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const disableApi = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Disabling Netdata API...')

  // Check if netdata is installed
  const checkResult = await checkInstalled({ ssh, options })
  if (!checkResult.isInstalled) {
    return {
      success: false,
      message: 'Cannot disable API: Netdata is not installed.',
    }
  }

  // Backup original configuration
  await ssh.execCommand(
    'sudo cp /etc/netdata/netdata.conf /etc/netdata/netdata.conf.backup 2>/dev/null || true',
    options,
  )

  // Check if the configuration file exists
  const configCheck = await ssh.execCommand(
    'test -f /etc/netdata/netdata.conf && echo "exists" || echo "not found"',
    options,
  )

  if (configCheck.stdout.trim() === 'not found') {
    // Create a minimal config file with API restrictions
    await ssh.execCommand('sudo mkdir -p /etc/netdata', options)
    await ssh.execCommand(
      'echo "[web]\n    mode = static-threaded\n    bind to = 127.0.0.1\n    allow connections from = localhost\n    enable gzip compression = no\n" | sudo tee /etc/netdata/netdata.conf',
      options,
    )
  } else {
    // Update existing config to disable API
    const updateCommands = [
      "sudo sed -i 's/bind to = .*/bind to = 127.0.0.1/g' /etc/netdata/netdata.conf",
      "sudo sed -i 's/allow connections from = .*/allow connections from = localhost/g' /etc/netdata/netdata.conf",
      "sudo sed -i 's/enable gzip compression = .*/enable gzip compression = no/g' /etc/netdata/netdata.conf",
    ]

    for (const cmd of updateCommands) {
      await ssh.execCommand(cmd, options)
    }
  }

  // Restart netdata to apply changes
  const restartResult = await ssh.execCommand(
    'sudo systemctl restart netdata',
    options,
  )

  // Verify the API is not accessible remotely
  // Try to access from a non-localhost address
  const apiCheck = await ssh.execCommand(
    'curl -s --connect-timeout 3 http://$(hostname -I | awk \'{print $1}\'):19999/api/v1/info 2>/dev/null || echo "API not accessible"',
    options,
  )

  return {
    success: apiCheck.stdout.includes('API not accessible'),
    message: apiCheck.stdout.includes('API not accessible')
      ? 'Netdata API disabled successfully (restricted to localhost only)'
      : 'Failed to disable Netdata API properly',
    output: restartResult.stdout,
    error: restartResult.stderr,
  }
}
