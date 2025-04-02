import { NodeSSH, SSHExecOptions } from 'node-ssh'

import { supportedDokkuVersion } from '@/lib/constants'

export const install = async (ssh: NodeSSH, options?: SSHExecOptions) => {
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
