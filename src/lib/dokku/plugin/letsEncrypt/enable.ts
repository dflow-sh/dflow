import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const enable = async (
  ssh: NodeSSH,
  name: string,
  options?: SSHExecOptions,
) => {
  const resultLetsEncryptEnabled = await ssh.execCommand(
    `dokku letsencrypt:enable ${name}`,
    options,
  )

  return resultLetsEncryptEnabled
}
