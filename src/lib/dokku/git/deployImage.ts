import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  appName: string
  options: SSHExecOptions
}

export const deployImage = async ({ ssh, options, appName }: Args) => {
  const resultDeployImage = await ssh.execCommand(
    `dokku git:from-image ${appName} ${appName}-docker`,
    options,
  )

  return resultDeployImage
}
