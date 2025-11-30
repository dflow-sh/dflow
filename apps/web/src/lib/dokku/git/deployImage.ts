import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  appName: string
  options?: SSHExecOptions
  imageName: string
}

export const deployImage = async ({
  ssh,
  options,
  appName,
  imageName,
}: Args) => {
  const resultDeployImage = await ssh.execCommand(
    `dokku git:from-image ${appName} ${imageName}`,
    options,
  )

  return resultDeployImage
}
