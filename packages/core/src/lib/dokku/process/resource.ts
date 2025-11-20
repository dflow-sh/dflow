import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const resourceLimit = async (
  ssh: NodeSSH,
  appName: string,
  resourceArgs: string[], // e.g. ["--cpu 100", "--memory 100"]
  processType?: string,
  options?: SSHExecOptions,
) => {
  let cmd = `dokku resource:limit`

  if (processType) cmd += ` --process-type ${processType}`
  if (resourceArgs.length) cmd += ` ${resourceArgs.join(' ')}`
  cmd += ` ${appName}`

  const result = await ssh.execCommand(cmd, options)

  if (result.code !== 0) {
    throw new Error(result.stderr)
  }

  return result
}

export const resourceReserve = async (
  ssh: NodeSSH,
  appName: string,
  resourceArgs: string[],
  processType?: string,
  options?: SSHExecOptions,
) => {
  let cmd = `dokku resource:reserve`

  if (processType) cmd += ` --process-type ${processType}`
  if (resourceArgs.length) cmd += ` ${resourceArgs.join(' ')}`
  cmd += ` ${appName}`

  const result = await ssh.execCommand(cmd, options)

  if (result.code !== 0) {
    throw new Error(result.stderr)
  }

  return result
}

export const resourceLimitClear = async (
  ssh: NodeSSH,
  appName: string,
  processType?: string,
  options?: SSHExecOptions,
) => {
  let cmd = `dokku resource:limit-clear`

  if (processType) cmd += ` --process-type ${processType}`
  cmd += ` ${appName}`

  const result = await ssh.execCommand(cmd, options)

  if (result.code !== 0) {
    throw new Error(result.stderr)
  }

  return result
}

export const resourceReserveClear = async (
  ssh: NodeSSH,
  appName: string,
  processType?: string,
  options?: SSHExecOptions,
) => {
  let cmd = `dokku resource:reserve-clear`

  if (processType) cmd += ` --process-type ${processType}`
  cmd += ` ${appName}`

  const result = await ssh.execCommand(cmd, options)

  if (result.code !== 0) {
    throw new Error(result.stderr)
  }

  return result
}

export const resourceReport = async (
  ssh: NodeSSH,
  appName?: string,
  flag?: string,
  options?: SSHExecOptions,
) => {
  let cmd = `dokku resource:report`

  if (appName) cmd += ` ${appName}`
  if (flag) cmd += ` ${flag}`

  const result = await ssh.execCommand(cmd, options)

  if (result.code !== 0) {
    throw new Error(result.stderr)
  }

  return {
    ...result,
    parsed: parseResourceReportOutput(result.stdout),
  }
}

// Parses Dokku resource:report output into structured data per process type
export const parseResourceReportOutput = (output = '') =>
  output
    .split('\n')
    .map(line =>
      line.match(/^\s*(\w+)\s+(limit|reserve)\s+(cpu|memory):\s+([\w.]+)/),
    )
    .filter(Boolean)
    .reduce(
      (acc, match) => {
        if (!match) return acc
        const [, process, type, resource, value] = match

        if (!acc[process]) acc[process] = {}
        if (!acc[process][type]) acc[process][type] = {}
        acc[process][type][resource] = value

        return acc
      },
      {} as Record<string, Record<string, Record<string, string>>>,
    )
