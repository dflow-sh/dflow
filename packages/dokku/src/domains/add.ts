import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const add = async (
  ssh: NodeSSH,
  name: string,
  domainName: string,
  options?: SSHExecOptions,
) => {
  const resultAddDomain = await ssh.execCommand(
    `dokku domains:add ${name} ${domainName}`,
    options,
  )

  if (resultAddDomain.code === 1) {
    throw new Error(resultAddDomain.stderr)
  }

  return resultAddDomain
}
