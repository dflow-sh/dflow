import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const importDB = async (
  ssh: NodeSSH,
  databaseType: string,
  databaseName: string,
  dumpFileName: string,
  options?: SSHExecCommandOptions,
) => {
  const result = await ssh.execCommand(
    `dokku ${databaseType}:import ${databaseName} < ${dumpFileName}`,
    options,
  )
  console.log('Backup Import Result:', result)

  return result
}
