import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  action: 'add' | 'clear' | 'remove' | 'report'
  appName: string
  phase: 'build' | 'run' | 'deploy'
  option: string
  ssh: NodeSSH
  options?: SSHExecOptions
}

export const options = async ({
  action,
  appName,
  option,
  phase,
  ssh,
  options,
}: Args) => {
  const resultOptions = await ssh.execCommand(
    `dokku docker-options:${action} ${appName} ${phase} '${option}'`,
    options,
  )

  return resultOptions
}
