import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const removeGlobal = async ({
  domains,
  ssh,
  options,
}: {
  ssh: NodeSSH
  domains: string[]
  options?: SSHExecOptions
}) => {
  const resultRemoveGlobalDomain = await ssh.execCommand(
    `dokku domains:remove-global ${domains.join(' ')}`,
    options,
  )

  if (resultRemoveGlobalDomain.code === 1) {
    throw new Error(resultRemoveGlobalDomain.stderr)
  }

  return resultRemoveGlobalDomain
}
