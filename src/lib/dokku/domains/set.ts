import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const set = async (
  ssh: NodeSSH,
  name: string,
  domainName: string,
  options?: SSHExecCommandOptions,
) => {
  const resultSetDomain = await ssh.execCommand(
    `dokku domains:set ${name} ${domainName}`,
    options,
  )

  if (resultSetDomain.code === 1) {
    throw new Error(resultSetDomain.stderr)
  }

  return resultSetDomain
}
