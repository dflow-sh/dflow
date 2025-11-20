import { NodeSSH } from 'node-ssh'

interface Args {
  ssh: NodeSSH
}

export const infoRailpack = async ({ ssh }: Args) => {
  const resultInstallRailpack = await ssh.execCommand(`sudo railpack --version`)

  if (resultInstallRailpack.code === 1 || resultInstallRailpack.code === 127) {
    console.error(resultInstallRailpack)
    return 'not-installed'
  }

  const version = resultInstallRailpack.stdout.split(' ').at(-1)
  return version
}
