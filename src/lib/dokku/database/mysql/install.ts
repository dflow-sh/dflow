import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  options?: SSHExecOptions
}

export const install = async (args: Args) => {
  const resultMySQLInstall = await args.ssh.execCommand(
    `sudo dokku plugin:install https://github.com/dokku/dokku-mysql.git mysql`,
    args.options,
  )

  return resultMySQLInstall
}
