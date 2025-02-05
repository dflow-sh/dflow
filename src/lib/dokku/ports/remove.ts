import { NodeSSH } from 'node-ssh'

export const portsRemove = async (
  ssh: NodeSSH,
  appName: string,
  scheme: string,
  host: string,
  container: string,
) => {
  const resultPorts = await ssh.execCommand(
    `dokku ports:remove ${appName} ${scheme}:${host}:${container}`,
  )

  if (resultPorts.code === 1) {
    throw new Error(resultPorts.stderr)
  }
}
