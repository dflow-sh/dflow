import type { SSHExecCommandResponse } from 'node-ssh'
import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const scale = async (
  ssh: NodeSSH,
  appName: string,
  scaleArgs: string[],
  options?: SSHExecOptions,
) => {
  const args = scaleArgs.length ? ` ${scaleArgs.join(' ')}` : ''

  const result = await ssh.execCommand(
    `dokku ps:scale${args ? ' ' + appName + args : ' ' + appName}`,
    options,
  )

  if (result.code !== 0) {
    throw new Error(result.stderr)
  }

  return result
}

export const psReport = async (
  ssh: NodeSSH,
  appName?: string,
  flag?: string,
  options?: SSHExecOptions,
) => {
  let cmd = `dokku ps:report`

  if (appName) cmd += ` ${appName}`
  if (flag) cmd += ` ${flag}`

  const result = await ssh.execCommand(cmd, options)

  if (result.code !== 0) {
    throw new Error(result.stderr)
  }

  return {
    ...result,
    parsed: parseScaleOutput(result.stdout),
  }
}

export const parseScaleOutput = (output = '') =>
  output
    .split('\n')
    .map(line => line.match(/^(\w+):\s+(\d+)/))
    .filter(Boolean)
    .reduce(
      (acc, match) => {
        if (match) acc[match[1]] = Number(match[2])
        return acc
      },
      {} as Record<string, number>,
    )

// Get current scale for an app (dokku ps:scale <app>)
export const psScale = async (
  ssh: NodeSSH,
  appName: string,
  options?: SSHExecOptions,
  parse: boolean = true,
): Promise<SSHExecCommandResponse & { parsed?: Record<string, number> }> => {
  const result = await ssh.execCommand(`dokku ps:scale ${appName}`, options)

  if (result.code !== 0) {
    throw new Error(result.stderr)
  }

  return parse
    ? { ...result, parsed: parseScaleOutput(result.stdout) }
    : { ...result, parsed: undefined }
}
