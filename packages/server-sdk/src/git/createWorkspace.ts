import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  appName: string
  options: SSHExecOptions
}

export const createWorkspace = async ({ appName, options, ssh }: Args) => {
  const resultWorkspace = await ssh.execCommand(
    `sudo mkdir -p /home/dokku/${appName}-docker && \
    sudo git --git-dir=/home/dokku/${appName} --work-tree=/home/dokku/${appName}-docker checkout -f
    `,
    options,
  )
  return resultWorkspace
}
