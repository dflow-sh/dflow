import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const uninstall = async (
  ssh: NodeSSH,
  pluginName: string,
  options?: SSHExecCommandOptions,
) => {
  // TODO validate plugin url to allow only url finishing with .git
  const resultPluginUnInstall = await ssh.execCommand(
    `sudo dokku plugin:uninstall ${pluginName}`,
    options,
  )

  if (resultPluginUnInstall.code === 1) {
    console.error(resultPluginUnInstall)
    throw new Error(resultPluginUnInstall.stderr)
  }

  return resultPluginUnInstall
}
