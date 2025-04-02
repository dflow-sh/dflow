import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  options: SSHExecOptions
}

export const installRailpack = async ({ options, ssh }: Args) => {
  const resultInstallRailpack = await ssh.execCommand(
    `curl -sSL https://railpack.com/install.sh | sh`,
    options,
  )

  return resultInstallRailpack
}
