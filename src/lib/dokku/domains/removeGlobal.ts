import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const removeGlobal = async (
  ssh: NodeSSH,
  domainName: string,
  options?: SSHExecOptions,
) => {
  const resultRemoveGlobalDomain = await ssh.execCommand(
    `dokku domains:remove-global ${domainName}`,
    options,
  )

  if (resultRemoveGlobalDomain.code === 1) {
    throw new Error(resultRemoveGlobalDomain.stderr)
  }

  return resultRemoveGlobalDomain
}
