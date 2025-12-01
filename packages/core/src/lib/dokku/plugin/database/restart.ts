import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const restart = async (
  ssh: NodeSSH,
  name: string,
  databaseType: string,
  options?: SSHExecOptions,
) => {
  const resultDatabaseRestart = await ssh.execCommand(
    `dokku ${databaseType}:restart ${name}`,
    options,
  )

  return resultDatabaseRestart
}
