import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const addGlobal = async ({
  ssh,
  domains,
  options,
}: {
  ssh: NodeSSH
  domains: string[]
  options?: SSHExecOptions
}) => {
  const resultAddGlobalDomain = await ssh.execCommand(
    `dokku domains:add-global ${domains.join(' ')}`,
    options,
  )

  if (resultAddGlobalDomain.code === 1) {
    throw new Error(resultAddGlobalDomain.stderr)
  }

  return resultAddGlobalDomain
}
