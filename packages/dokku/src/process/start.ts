import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const start = async (
  ssh: NodeSSH,
  name: string,
  options?: SSHExecOptions,
) => {
  const resultAppStart = await ssh.execCommand(
    `dokku ps:start ${name}`,
    options,
  )

  return resultAppStart
}
