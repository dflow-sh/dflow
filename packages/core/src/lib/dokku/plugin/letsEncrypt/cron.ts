import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const addCron = async (
  ssh: NodeSSH,
  options?: SSHExecCommandOptions,
) => {
  // TODO validate plugin url to allow only url finishing with .git
  const resultAddCron = await ssh.execCommand(
    `dokku letsencrypt:cron-job --add`,
    options,
  )

  if (resultAddCron.code === 1) {
    console.error(resultAddCron)
    throw new Error(resultAddCron.stderr)
  }

  return resultAddCron
}
