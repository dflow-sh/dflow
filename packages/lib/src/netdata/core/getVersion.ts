import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const getVersion = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  // Get Netdata version
  const versionCheck = await ssh.execCommand('netdata -v 2>/dev/null', options)

  return versionCheck.stdout.trim() || null
}
