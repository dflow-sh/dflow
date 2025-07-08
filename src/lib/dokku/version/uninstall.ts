import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const uninstall = async (
  ssh: NodeSSH,
  options?: SSHExecOptions,
  fullCleanup: boolean = false,
) => {
  const dpkgLockCheck = await ssh.execCommand(
    'lsof /var/lib/dpkg/lock-frontend',
    options,
  )

  if (dpkgLockCheck.code === 0) {
    throw new Error(
      'dpkg is currently locked. Please wait for any ongoing package operations to complete.',
    )
  }

  const dokkuUninstallResult = await ssh.execCommand(
    'sudo apt-get remove --purge dokku -y',
    options,
  )

  if (dokkuUninstallResult.code !== 0) {
    throw new Error(dokkuUninstallResult.stderr)
  }

  let cleanupResults: any = null
  if (fullCleanup) {
    const cleanupCommands = [
      'sudo deluser --remove-home dokku || true',
      'sudo delgroup dokku || true',
      'sudo rm -rf /var/lib/dokku /home/dokku /etc/dokku /var/log/dokku /var/cache/dokku',
    ].join(' && ')

    cleanupResults = await ssh.execCommand(cleanupCommands, options)
  }

  return {
    dokkuUninstallResult,
    cleanupResults,
  }
}
