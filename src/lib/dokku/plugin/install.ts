import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const install = async ({
  ssh,
  pluginUrl,
  pluginName,
  options = {},
}: {
  ssh: NodeSSH
  pluginUrl: string
  pluginName: string
  options?: SSHExecCommandOptions
}) => {
  const pluginURLValidate = pluginUrl.endsWith('.git')

  if (!pluginURLValidate) {
    console.error('ensure the plugin url ends with .git')
    throw new Error('ensure the plugin url ends with .git')
  }

  const resultPluginInstall = await ssh.execCommand(
    `sudo dokku plugin:install ${pluginUrl} ${pluginName}`,
    options,
  )

  if (resultPluginInstall.code === 1) {
    console.error(resultPluginInstall)
    throw new Error(resultPluginInstall.stderr)
  }

  return resultPluginInstall
}
