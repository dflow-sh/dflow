import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const addGlobalEmail = async (
  ssh: NodeSSH,
  email: string,
  options?: SSHExecCommandOptions,
) => {
  const resultAddGlobalEmail = await ssh.execCommand(
    `dokku letsencrypt:set --global email ${email}`,
    options,
  )

  if (resultAddGlobalEmail.code === 1) {
    console.error(resultAddGlobalEmail)
    throw new Error(resultAddGlobalEmail.stderr)
  }

  return resultAddGlobalEmail
}
