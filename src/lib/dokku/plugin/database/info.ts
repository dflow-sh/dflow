import { NodeSSH } from 'node-ssh'

export const info = async (
  ssh: NodeSSH,
  databaseName: string,
  databaseType: string,
) => {
  const resultDatabaseInfo = await ssh.execCommand(
    `dokku ${databaseType}:info ${databaseName}`,
  )
  if (resultDatabaseInfo.code === 1) {
    console.error(resultDatabaseInfo)
    throw new Error(resultDatabaseInfo.stderr)
  }

  return resultDatabaseInfo
}
