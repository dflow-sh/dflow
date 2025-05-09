import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const listGlobal = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecOptions
}) => {
  const resultListGlobalDomains = await ssh.execCommand(
    `dokku domains:report --global --domains-global-vhosts`,
    options,
  )

  if (resultListGlobalDomains.code === 1) {
    throw new Error(resultListGlobalDomains.stderr)
  }

  return resultListGlobalDomains.stdout
    .split(' ')
    .filter(line => line.trim() !== '')
}
