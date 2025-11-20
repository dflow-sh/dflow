import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const exportDB = async (
  ssh: NodeSSH,
  databaseType: string,
  databaseName: string,
  dumpFileName: string,
  options?: SSHExecCommandOptions,
) => {
  const result = await ssh.execCommand(
    `dokku ${databaseType}:export ${databaseName} > ${dumpFileName}`,
    options,
  )
  console.log('Backup Export Result:', result)

  return result
}
