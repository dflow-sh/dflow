import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const stopAll = async (ssh: NodeSSH, options?: SSHExecOptions) => {
  const resultAllAppsStop = await ssh.execCommand(
    `dokku ps:stop --all`,
    options,
  )

  console.log({ resultAllAppsStop })

  if (resultAllAppsStop.code !== 0) {
    throw new Error(resultAllAppsStop.stderr)
  }

  return true
}
