import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const portsSet = async ({
  ssh,
  appName,
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
    `dokku ports:set ${appName} ${ports.map(({ container, host, scheme }) => `${scheme}:${host}:${container}`).join(' ')}`,
    options,
  )

  if (resultPorts.code === 1) {
    throw new Error(resultPorts.stderr)
  }

  return true
}
