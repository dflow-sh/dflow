import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const uninstall = async (ssh: NodeSSH, options?: SSHExecOptions) => {
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
    'sudo apt-get purge dokku herokuish -y',
    options,
  )

  if (dokkuUninstallResult.code !== 0) {
    throw new Error(dokkuUninstallResult.stderr)
  }

  return {
    dokkuUninstallResult,
  }
}
