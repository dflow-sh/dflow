import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const addEmail = async ({
  ssh,
  email,
  options,
  appName,
}: {
  ssh: NodeSSH
  email: string
  options?: SSHExecCommandOptions
  appName: string
}) => {
  const resultAddEmail = await ssh.execCommand(
    `dokku letsencrypt:set ${appName} email ${email}`,
    options,
  )

  if (resultAddEmail.code === 1) {
    console.error(resultAddEmail)
    throw new Error(resultAddEmail.stderr)
  }

  return resultAddEmail
}
