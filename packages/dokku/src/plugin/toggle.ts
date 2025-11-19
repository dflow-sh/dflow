import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  enabled: boolean
  pluginName: string
  options?: SSHExecOptions
}

export const toggle = async (args: Args) => {
  const resultPluginStatus = await args.ssh.execCommand(
    `sudo dokku plugin:${args.enabled ? 'enable' : 'disable'} ${args.pluginName}`,
    args.options,
  )

  return resultPluginStatus
}
