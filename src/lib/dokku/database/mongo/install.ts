import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  options?: SSHExecOptions
}

export const install = async (args: Args) => {
  const resultMongoInstall = await args.ssh.execCommand(
    `sudo dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo`,
    args.options,
  )

  return resultMongoInstall
}
