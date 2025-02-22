import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  options?: SSHExecOptions
}

export const install = async (args: Args) => {
  const resultPostgresInstall = await args.ssh.execCommand(
    `sudo dokku plugin:install https://github.com/dokku/dokku-postgres.git postgres`,
    args.options,
  )

  return resultPostgresInstall
}
