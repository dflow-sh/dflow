import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

import { checkInstalled } from './checkInstalled'

/**
 * Enables the Netdata API
 * @param ssh SSH connection to the remote system
 * @param options SSH execution options
 * @returns Object with success status and output/error messages
 */
export const enableApi = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  console.log('Enabling Netdata API...')

  // Check if netdata is installed
  const checkResult = await checkInstalled({ ssh, options })
  if (!checkResult.isInstalled) {
    return {
      success: false,
      message: 'Cannot enable API: Netdata is not installed.',
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
    // Create a minimal config file if it doesn't exist
    await ssh.execCommand('sudo mkdir -p /etc/netdata', options)
    await ssh.execCommand(
      'echo "[web]\n    mode = static-threaded\n    bind to = *\n    allow connections from = *\n    enable gzip compression = yes\n" | sudo tee /etc/netdata/netdata.conf',
      options,
    )
  } else {
    // Update existing config to enable API
    const updateCommands = [
      "sudo sed -i 's/\\[web\\]/\\[web\\]\\n    allow connections from = *\\n    enable gzip compression = yes/g' /etc/netdata/netdata.conf",
      "sudo sed -i 's/bind to = .*/bind to = */g' /etc/netdata/netdata.conf",
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

  // Verify the API is accessible
  const apiCheck = await ssh.execCommand(
    'curl -s http://localhost:19999/api/v1/info || echo "API not accessible"',
    options,
  )

  return {
    success:
      apiCheck.stdout.includes('version') &&
      !apiCheck.stdout.includes('API not accessible'),
    message: apiCheck.stdout.includes('version')
      ? 'Netdata API enabled successfully'
      : 'Failed to enable Netdata API properly',
    output: restartResult.stdout,
    error: restartResult.stderr,
  }
}
