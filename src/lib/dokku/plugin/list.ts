import { NodeSSH } from 'node-ssh'

// const parsePluginListCommand = (commandResult: string) => {
//   const plugins = commandResult.split('\n')

//   console.dir({ plugins }, { depth: Infinity })

//   // First line is the plugin version
//   const pluginVersion = plugins[0]
//   // We remove the first line since it's not related to the installed plugins
//   plugins.splice(0, 1)
//   return {
//     version: pluginVersion.split(' ')[1],
//     plugins: plugins.map(plugin => {
//       const split = plugin.split(' ').filter(a => a !== '')
//       return {
//         name: split[0],
//         version: split[1],
//       }
//     }),
//   }
// }

const parsePluginListCommand = (commandResult: string) => {
  const plugins = commandResult
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean) // Trim and remove empty lines

  // First line is the plugin version, extract it
  const pluginVersion = plugins[0].split(/\s+/)[1] // Assuming it's always in "dokku version x.y.z"

  // Process plugin list
  const parsedPlugins = plugins.slice(1).map(plugin => {
    const split = plugin.split(/\s+/) // Split by spaces (handles inconsistent spacing)

    return {
      name: split[0], // Plugin name
      version: split[1], // Plugin version
      status: split[2] === 'enabled', // Convert "enabled" to true/false
    }
  })

  return {
    version: pluginVersion,
    plugins: parsedPlugins,
  }
}

export const list = async (ssh: NodeSSH) => {
  const resultPluginList = await ssh.execCommand('dokku plugin:list')
  if (resultPluginList.code === 1) {
    console.error(resultPluginList)
    throw new Error(resultPluginList.stderr)
  }

  return parsePluginListCommand(resultPluginList.stdout)
}
