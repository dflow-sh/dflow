import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const expose = async ({
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
  const resultDatabasePortExpose = await ssh.execCommand(
    `dokku ${databaseType}:expose ${name} ${ports.join(' ')}`,
    options,
  )

  return resultDatabasePortExpose
}
