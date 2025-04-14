import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const link = async ({
  ssh,
  appName,
  databaseName,
  databaseType,
  options,
  alias,
  noRestart = true,
}: {
  ssh: NodeSSH
  databaseName: string
  databaseType: string
  appName: string
  options?: SSHExecOptions
  alias?: string
  noRestart?: boolean
}) => {
  const resultDatabaseLink = await ssh.execCommand(
    `dokku ${databaseType}:link ${databaseName} ${appName} ${alias ? `--alias ${alias}` : ''} ${noRestart ? '--no-restart' : ''}`,
    options,
  )

  return resultDatabaseLink
}
