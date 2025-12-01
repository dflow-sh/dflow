import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const auth = async (
  ssh: NodeSSH,
  databaseType: string,
  databaseName: string,
  awsAccessKeyId: string,
  awsSecretAccessKey: string,
  awsDefaultRegion: string,
  provider: number,
  endPointUrl: string,
  options?: SSHExecCommandOptions,
) => {
  const result = await ssh.execCommand(
    `dokku ${databaseType}:backup-auth ${databaseName} ${awsAccessKeyId} ${awsSecretAccessKey} ${awsDefaultRegion} ${provider} ${endPointUrl}`,
    options,
  )

  console.log('Backup Auth Result:', result)

  return result
}
