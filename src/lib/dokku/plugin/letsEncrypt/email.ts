import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const letsencryptEmail = async (
  ssh: NodeSSH,
  email: string,
  options?: SSHExecCommandOptions,
) => {
  // TODO validate plugin url to allow only url finishing with .git
  const resultLetsencryptEmail = await ssh.execCommand(
    `dokku letsencrypt:set --global email ${email}`,
    options,
  )

  if (resultLetsencryptEmail.code === 1) {
    console.error(resultLetsencryptEmail)
    throw new Error(resultLetsencryptEmail.stderr)
  }

  return resultLetsencryptEmail
}
