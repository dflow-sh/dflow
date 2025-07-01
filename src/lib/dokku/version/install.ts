import { NodeSSH, SSHExecOptions } from 'node-ssh'

import { supportedDokkuVersion } from '@/lib/constants'

export const install = async (ssh: NodeSSH, options?: SSHExecOptions) => {
  // Check if dpkg is locked before proceeding
  const dpkgLockCheck = await ssh.execCommand(
    'lsof /var/lib/dpkg/lock-frontend',
    options,
  )

  if (dpkgLockCheck.code === 0) {
    throw new Error(
      'dpkg is currently locked. Please wait for any ongoing package operations to complete.',
    )
  }

  const dokkuDownloadResult = await ssh.execCommand(
    `wget -NP . https://dokku.com/bootstrap.sh`,
    options,
  )

  if (dokkuDownloadResult.code === 1) {
    throw new Error(dokkuDownloadResult.stderr)
  }

  const dokkuInstallationResult = await ssh.execCommand(
    `sudo DOKKU_TAG=v${supportedDokkuVersion} bash bootstrap.sh`,
    options,
  )

  if (dokkuInstallationResult.code === 1) {
    throw new Error(dokkuInstallationResult.stderr)
  }

  return dokkuInstallationResult
}
