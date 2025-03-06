import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const portsSet = async (
  ssh: NodeSSH,
  appName: string,
  scheme: string,
  host: string,
  container: string,
  options?: SSHExecOptions,
) => {
  const resultPorts = await ssh.execCommand(
    `dokku ports:set ${appName} ${scheme}:${host}:${container}`,
    options,
  )

  console.log({ resultPorts })

  if (resultPorts.code === 1) {
    throw new Error(resultPorts.stderr)
  }

  return true
}
