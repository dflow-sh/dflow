import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const restartWettyContainer = async (
  ssh: NodeSSH,
  containerId: string,
  options?: SSHExecOptions,
) => {
  const result = await ssh.execCommand(`docker restart ${containerId}`, options)

  if (result.code === 1) {
    throw new Error(result.stderr)
  }

  return result
}
