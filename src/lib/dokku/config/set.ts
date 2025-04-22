import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const set = async ({
  ssh,
  name,
  values,
  noRestart = false,
  encoded = false,
  options,
}: {
  ssh: NodeSSH
  name: string
  values: { key: string; value: string } | { key: string; value: string }[]
  noRestart?: boolean
  encoded?: boolean
  options?: SSHExecCommandOptions
}) => {
  if (!Array.isArray(values)) {
    values = [values]
  }

  const resultSetEnv = await ssh.execCommand(
    `dokku config:set ${noRestart ? '--no-restart' : ''} ${
      encoded ? '--encoded' : ''
    } ${name} ${values.map(data => ` "${data.key}"="${data.value}"`).join('')}`,
    options,
  )

  if (resultSetEnv.code === 1) {
    throw new Error(resultSetEnv.stderr)
  }

  return true
}
