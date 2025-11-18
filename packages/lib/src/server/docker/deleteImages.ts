import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  images: string[]
  ssh: NodeSSH
  options?: SSHExecOptions
}

export const deleteImages = async ({ ssh, options, images }: Args) => {
  const resultOptions = await ssh.execCommand(
    `sudo docker image rm ${images.join(' ')} --force`,
    options,
  )

  return resultOptions
}
