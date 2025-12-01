import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  token: string
  username: string
  options?: SSHExecOptions
  hostname: string
}

export const auth = async (args: Args) => {
  const resultGitAuth = await args.ssh.execCommand(
    `dokku git:auth ${args.hostname} ${args.username} ${args.token}`,
    args.options,
  )

  if (resultGitAuth.code === 1) {
    throw new Error(resultGitAuth.stderr)
  }

  return true
}
