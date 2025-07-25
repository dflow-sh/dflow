import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const portsRemove = async ({
  appName,
  ssh,
  ports,
  options,
}: {
  ssh: NodeSSH
  appName: string
  ports: {
    scheme: string
    host: string
    container: string
  }[]
  options?: SSHExecOptions
}) => {
  const resultPorts = await ssh.execCommand(
    `dokku ports:remove ${appName} ${ports.map(({ container, host, scheme }) => `${scheme}:${host}:${container}`).join(' ')}`,
    options,
  )

  if (resultPorts.code === 1) {
    throw new Error(resultPorts.stderr)
  }

  return resultPorts
}
