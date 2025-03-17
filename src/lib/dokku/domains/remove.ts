import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const remove = async (
  ssh: NodeSSH,
  name: string,
  domainName: string,
  options?: SSHExecOptions,
) => {
  const resultRemoveDomain = await ssh.execCommand(
    `dokku domains:remove ${name} ${domainName}`,
    options,
  )

  if (resultRemoveDomain.code === 1) {
    throw new Error(resultRemoveDomain.stderr)
  }

  return resultRemoveDomain
}
