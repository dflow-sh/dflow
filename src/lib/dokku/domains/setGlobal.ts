import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const setGlobal = async ({
  domains,
  ssh,
  options,
}: {
  ssh: NodeSSH
  domains: string[]
  options?: SSHExecOptions
}) => {
  const resultSetGlobalDomain = await ssh.execCommand(
    `dokku domains:set-global ${domains.join(' ')}`,
    options,
  )

  if (resultSetGlobalDomain.code === 1) {
    throw new Error(resultSetGlobalDomain.stderr)
  }

  return resultSetGlobalDomain
}
