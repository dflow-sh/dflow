import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const install = async (
  ssh: NodeSSH,
  pluginUrl: string,
  options?: SSHExecCommandOptions,
) => {
  // TODO validate plugin url to allow only url finishing with .git
  const resultPluginInstall = await ssh.execCommand(
    `sudo dokku plugin:install ${pluginUrl}`,
    options,
  )

  if (resultPluginInstall.code === 1) {
    console.error(resultPluginInstall)
    throw new Error(resultPluginInstall.stderr)
  }

  return resultPluginInstall
}
