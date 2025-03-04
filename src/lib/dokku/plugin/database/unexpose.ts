import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const unexpose = async ({
  ssh,
  databaseType,
  name,
  ports,
  options,
}: {
  ssh: NodeSSH
  name: string
  databaseType: string
  ports: Array<string>
  options?: SSHExecOptions
}) => {
  const resultDatabasePortUnexpose = await ssh.execCommand(
    `dokku ${databaseType}:unexpose ${name} ${ports.join(' ')}`,
    options,
  )

  return resultDatabasePortUnexpose
}
