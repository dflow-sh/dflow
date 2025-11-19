import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const restart = async (
  ssh: NodeSSH,
  appName: string,
  options?: SSHExecOptions,
) => {
  const resultAppsRestart = await ssh.execCommand(
    `dokku ps:restart ${appName}`,
    options,
  )

  console.log({ resultAppsRestart })

  if (resultAppsRestart.code === 1) {
    throw new Error(resultAppsRestart.stderr)
  }

  return true
}
