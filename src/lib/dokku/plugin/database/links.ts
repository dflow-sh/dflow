import { NodeSSH } from 'node-ssh'

export const links = async ({
  ssh,
  databaseName,
  databaseType,
}: {
  ssh: NodeSSH
  databaseType: string
  databaseName: string
}) => {
  const resultDatabaseLinks = await ssh.execCommand(
    `dokku ${databaseType}:links ${databaseName}`,
  )

  if (resultDatabaseLinks.code === 1) {
    console.error(resultDatabaseLinks)
    throw new Error(resultDatabaseLinks.stderr)
  }

  return resultDatabaseLinks.stdout.split('\n')
}
