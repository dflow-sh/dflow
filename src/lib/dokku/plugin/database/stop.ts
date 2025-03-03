import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const stop = async (
  ssh: NodeSSH,
  name: string,
  databaseType: string,
  options?: SSHExecOptions,
) => {
  const resultDatabaseStop = await ssh.execCommand(
    `dokku ${databaseType}:stop ${name}`,
    options,
  )

  return resultDatabaseStop
}
