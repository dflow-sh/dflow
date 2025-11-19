import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const unset = async ({
  ssh,
  name,
  keys,
  noRestart = false,
  options,
}: {
  ssh: NodeSSH
  name: string
  keys: string[]
  noRestart?: boolean
  options?: SSHExecCommandOptions
}) => {
  const resultUnsetEnv = await ssh.execCommand(
    `dokku config:unset ${noRestart ? '--no-restart' : ''} ${name} ${keys.join(' ')}`,
    options,
  )

  if (resultUnsetEnv.code === 1) {
    throw new Error(resultUnsetEnv.stderr)
  }

  return resultUnsetEnv
}
