import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const stop = async (
  ssh: NodeSSH,
  appName: string,
  options?: SSHExecOptions,
) => {
  const resultAppsStop = await ssh.execCommand(
    `dokku ps:stop ${appName}`,
    options,
  )

  console.log({ resultAppsStop })

  if (resultAppsStop.code === 1) {
    throw new Error(resultAppsStop.stderr)
  }

  return true
}
