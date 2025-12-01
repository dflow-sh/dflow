import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const list = async ({
  ssh,
  options,
  appName,
}: {
  ssh: NodeSSH
  options?: SSHExecOptions
  appName: string
}) => {
  const resultListDomains = await ssh.execCommand(
    `dokku domains:report ${appName} --domains-app-vhosts`,
    options,
  )

  if (resultListDomains.code === 1) {
    throw new Error(resultListDomains.stderr)
  }

  return resultListDomains.stdout.split(' ').filter(line => line.trim() !== '')
}
