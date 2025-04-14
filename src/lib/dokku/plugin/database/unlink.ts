import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const unlink = async ({
  ssh,
  databaseName,
  databaseType,
  appName,
  options,
  noRestart = true,
}: {
  ssh: NodeSSH
  databaseName: string
  databaseType: string
  appName: string
  options?: SSHExecOptions
  noRestart?: boolean
}) => {
  const resultDatabaseUnLink = await ssh.execCommand(
    `dokku ${databaseType}:unlink ${databaseName} ${appName} ${noRestart ? '--no-restart' : ''}`,
    options,
  )

  return resultDatabaseUnLink
}
