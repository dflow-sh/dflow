import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const create = async (
  ssh: NodeSSH,
  appName: string,
  options?: SSHExecOptions,
) => {
  const resultAppsCreate = await ssh.execCommand(
    `dokku apps:create ${appName}`,
    options,
  )

  if (resultAppsCreate.code === 1) {
    throw new Error(resultAppsCreate.stderr)
  }

  return true
}
