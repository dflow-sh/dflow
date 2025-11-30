import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  options: SSHExecOptions
}

export const uninstallRailpack = async ({ options, ssh }: Args) => {
  const resultUninstallRailpack = await ssh.execCommand(
    `curl -sSL https://railpack.com/install.sh | bash -s -- --remove`,
    options,
  )

  // removing buildkitd container
  await ssh.execCommand(`sudo docker rm -f buildkitd`)

  return resultUninstallRailpack
}
