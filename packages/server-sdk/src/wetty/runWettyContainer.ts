import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const runWettyContainer = async (
  ssh: NodeSSH,
  sshHost: string,
  port: number = 3000,
  options?: SSHExecOptions,
) => {
  const command = `docker run --rm -p ${port}:3000 wettyoss/wetty --ssh-host=${sshHost}`

  const result = await ssh.execCommand(command, options)

  if (result.code === 1) {
    throw new Error(result.stderr)
  }

  return result
}
