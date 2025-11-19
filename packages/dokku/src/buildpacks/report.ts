import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  appName: string
  options?: SSHExecOptions
}

export const report = async ({ appName, ssh, options }: Args) => {
  const resultBuildpacksReport = await ssh.execCommand(
    `dokku buildpacks:report ${appName} --buildpacks-list`,
    options,
  )

  if (resultBuildpacksReport.code === 1) {
    throw new Error(resultBuildpacksReport.stderr)
  }

  return resultBuildpacksReport.stdout
    .split(',')
    .filter(line => line.trim() !== '')
}
