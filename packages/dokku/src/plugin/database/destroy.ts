import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const destroy = async (
  ssh: NodeSSH,
  databaseName: string,
  databaseType: string,
  options?: SSHExecCommandOptions,
) => {
  const resultDatabaseDestroy = await ssh.execCommand(
    `dokku ${databaseType}:destroy ${databaseName} --force`,
    options,
  )

  if (resultDatabaseDestroy.code === 1) {
    console.error(resultDatabaseDestroy)
    throw new Error(resultDatabaseDestroy.stderr)
  }

  return true
}
