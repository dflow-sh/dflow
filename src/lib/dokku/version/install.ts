import { NodeSSH } from 'node-ssh'

export const install = async (ssh: NodeSSH) => {
  const dokkuDownloadResult = await ssh.execCommand(
    `wget -NP . https://dokku.com/bootstrap.sh`,
  )

  if (dokkuDownloadResult.code === 1) {
    throw new Error(dokkuDownloadResult.stderr)
  }

  const dokkuInstallationResult = await ssh.execCommand(
    'sudo DOKKU_TAG=v0.35.15 bash bootstrap.sh',
  )

  if (dokkuInstallationResult.code === 1) {
    throw new Error(dokkuInstallationResult.stderr)
  }

  return { success: true }
}
