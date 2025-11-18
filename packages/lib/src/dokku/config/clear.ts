import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const clear = async ({
  ssh,
  name,
  options,
}: {
  ssh: NodeSSH
  name: string
  options?: SSHExecCommandOptions
}) => {
  const resultClearEnv = await ssh.execCommand(
    `dokku config:clear ${name}`,
    options,
  )

  if (resultClearEnv.code === 1) {
    throw new Error(resultClearEnv.stderr)
  }

  return resultClearEnv
}
