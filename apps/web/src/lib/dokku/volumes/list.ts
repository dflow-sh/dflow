import { NodeSSH } from 'node-ssh'

export const list = async (ssh: NodeSSH, appName: string) => {
  const resultVolumes = await ssh.execCommand(
    `dokku storage:list ${appName} --format json`,
  )

  if (resultVolumes.code === 1) {
    throw new Error(resultVolumes.stderr)
  }

  const volumes = JSON.parse(resultVolumes.stdout)

  return volumes
}
