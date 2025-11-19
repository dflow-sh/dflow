import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const listWettyContainers = async (
  ssh: NodeSSH,
  options?: SSHExecOptions,
) => {
  const result = await ssh.execCommand(
    'docker ps --filter "ancestor=wettyoss/wetty" --format "{{.ID}}\t{{.Status}}\t{{.Ports}}"',
    options,
  )

  if (result.code === 1) {
    throw new Error(result.stderr)
  }

  return result
}

export const stopWettyContainer = async (
  ssh: NodeSSH,
  containerId: string,
  options?: SSHExecOptions,
) => {
  const result = await ssh.execCommand(`docker stop ${containerId}`, options)

  if (result.code === 1) {
    throw new Error(result.stderr)
  }

  return result
}
