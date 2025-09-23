import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  appName: string
  buildPack: string
  options?: SSHExecOptions
}

export const set = async ({ appName, buildPack, ssh, options }: Args) => {
  const resultBuildpacksSet = await ssh.execCommand(
    `dokku buildpacks:set ${appName} ${buildPack}`,
    options,
  )

  return resultBuildpacksSet
}
