import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const report = async ({
  ssh,
  appName,
  options,
}: {
  ssh: NodeSSH
  appName: string
  options?: SSHExecCommandOptions
}) => {
  const resultReport = await ssh.execCommand(
    `dokku --quiet nginx:report ${appName}`,
    options,
  )

  if (resultReport.code === 1) {
    throw new Error(resultReport.stderr)
  }

  const nginxParams = resultReport.stdout.split('\n')

  const formattedParams = nginxParams
    .filter(param => param.includes('Nginx computed'))
    .map(log => {
      const [parameter, value = ''] = log
        .trim()
        .replaceAll('Nginx computed ', '')
        .split(':')
      const key = parameter.trim().replaceAll(' ', '-').toLowerCase()

      return { key, value: value.trim() }
    })

  return formattedParams
}
