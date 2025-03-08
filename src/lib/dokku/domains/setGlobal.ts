import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const setGlobal = async (
  ssh: NodeSSH,
  domainName: string,
  options?: SSHExecOptions,
) => {
  const resultSetGlobalDomain = await ssh.execCommand(
    `dokku domains:set-global ${domainName}`,
    options,
  )

  if (resultSetGlobalDomain.code === 1) {
    throw new Error(resultSetGlobalDomain.stderr)
  }

  return resultSetGlobalDomain
}
