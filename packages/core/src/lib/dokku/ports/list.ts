import { NodeSSH } from 'node-ssh'

export const portsList = async (ssh: NodeSSH, appName: string) => {
  const resultPorts = await ssh.execCommand(`dokku ports:list ${appName}`)

  if (resultPorts.code === 1) {
    throw new Error(resultPorts.stderr)
  }

  // Cleanup the output
  const ports = resultPorts.stdout
    .split('\n')
    // Remove all the lines containing ->
    .filter(line => !line.includes('->'))
    .map(line => {
      const data = line.split(' ').filter(line => line !== '')
      return { scheme: data[0], host: data[1], container: data[2] }
    })

  return ports
}
