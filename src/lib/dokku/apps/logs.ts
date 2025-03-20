import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

const parseLogsCommand = (commandResult: string) => {
  // We split logs into array by new line
  return commandResult.split('\n')
}

export const logs = async (
  ssh: NodeSSH,
  name: string,
  options?: SSHExecCommandOptions,
) => {
  const resultAppLogs = await ssh.execCommand(
    `dokku logs ${name} --tail`,
    options,
  )

  if (resultAppLogs.code === 1) {
    throw new Error(resultAppLogs.stderr)
  }

  return parseLogsCommand(resultAppLogs.stdout)
}
