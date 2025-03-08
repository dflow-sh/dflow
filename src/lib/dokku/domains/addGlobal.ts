import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const addGlobal = async (
  ssh: NodeSSH,
  domainName: string,
  options?: SSHExecOptions,
) => {
  const resultAddGlobalDomain = await ssh.execCommand(
    `dokku domains:add-global ${domainName}`,
    options,
  )

  if (resultAddGlobalDomain.code === 1) {
    throw new Error(resultAddGlobalDomain.stderr)
  }

  return resultAddGlobalDomain
}
