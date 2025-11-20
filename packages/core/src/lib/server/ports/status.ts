import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

// Using this command to get port status
// sudo netstat -tulnp | grep -e ":3000" -e ":3306" -e ":5432" -e ":8080"

export const status = async ({
  ssh,
  ports,
  options,
}: {
  ssh: NodeSSH
  ports: Array<string>
  options?: SSHExecCommandOptions
}) => {
  console.log(
    `sudo netstat -tulnp | grep ` +
      ports.map(port => `-e ":${port}" `).join(' '),
  )

  const resultPortsStatus = await ssh.execCommand(
    `sudo netstat -tulnp | grep ` +
      ports.map(port => `-e ":${port}" `).join(' '),
    options,
  )

  if (resultPortsStatus.code === 0) {
    return ports.map(port => ({
      port,
      available: !resultPortsStatus.stdout.includes(port),
    }))
  }

  // if code is 1 & there is no stderr, considering port as available
  if (
    resultPortsStatus.code === 1 &&
    resultPortsStatus.stdout.trim() === '' &&
    resultPortsStatus.stderr.trim() === ''
  ) {
    return ports.map(port => ({
      port,
      available: true,
    }))
  }
}
