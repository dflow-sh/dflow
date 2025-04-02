import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  appName: string
  options?: SSHExecOptions
}

export const deleteWorkspace = async ({ appName, options, ssh }: Args) => {
  const resultDeleteWorkspace = await ssh.execCommand(
    `rm -rf /home/dokku/${appName}-docker`,
    options,
  )
  return resultDeleteWorkspace
}
