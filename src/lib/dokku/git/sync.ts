import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  appName: string
  build?: boolean
  gitRepoUrl: string
  branchName: string
  options: SSHExecOptions
}

export const sync = async ({ build = true, ...args }: Args) => {
  const resultGitSync = await args.ssh.execCommand(
    `sudo dokku git:sync ${build ? '--build' : ''} ${args.appName} ${args.gitRepoUrl} ${args.branchName}`,
    args.options,
  )
  return resultGitSync
}
