import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const status = async ({
  appName,
  ssh,
  options,
}: {
  ssh: NodeSSH
  appName: string
  options?: SSHExecOptions
}) => {
  const resultLetsEncryptStatus = await ssh.execCommand(
    `dokku letsencrypt:active ${appName}`,
    options,
  )

  return resultLetsEncryptStatus
}
