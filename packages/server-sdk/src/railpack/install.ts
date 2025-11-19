import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  options: SSHExecOptions
}

export const installRailpack = async ({ options, ssh }: Args) => {
  const resultInstallRailpack = await ssh.execCommand(
    `sudo su -c "curl -sSL https://railpack.com/install.sh | sh"`,
    options,
  )

  // installing buildkitd which is required for railpack to work
  await ssh.execCommand(
    `sudo docker run -d --name buildkitd --privileged moby/buildkit:latest`,
  )

  // added restart parameter when container stopped
  await ssh.execCommand(`sudo docker update --restart=unless-stopped buildkitd`)

  return resultInstallRailpack
}
