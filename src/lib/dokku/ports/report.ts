import { NodeSSH } from 'node-ssh'

export const portsReport = async (ssh: NodeSSH, appName: string) => {
  const resultPortsReport = await ssh.execCommand(
    `dokku ports:report ${appName} --ports-map`,
  )

  if (resultPortsReport.code !== 0) {
    throw new Error(resultPortsReport.stderr)
  }

  console.log({ resultPortsReport })

  // Cleanup the output
  const ports = resultPortsReport.stdout
    .split(' ')
    // Remove all the lines containing ->
    .filter(line => line)

  return ports
}
