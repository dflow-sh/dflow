import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  imageName: string
  ssh: NodeSSH
  options?: SSHExecOptions
}

export const deleteImage = async ({ ssh, options, imageName }: Args) => {
  const resultOptions = await ssh.execCommand(
    `sudo docker image rm ${imageName} --force`,
    options,
  )

  return resultOptions
}
