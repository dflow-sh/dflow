import { NodeSSH, SSHExecOptions } from 'node-ssh'

import { supportedDokkuVersion } from '@/lib/constants'
import checkDpkgLock from '@/lib/utils/checkDpkgLock'

export const install = async (ssh: NodeSSH, options?: SSHExecOptions) => {
  // Check if dpkg is locked before proceeding
  await checkDpkgLock(ssh, options) // returns exec result if not locked

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
