import { NodeSSH } from 'node-ssh'

export const unmount = async ({
  ssh,
  appName,
  volume,
}: {
  ssh: NodeSSH
  appName: string
  volume: {
    host_path: string
    container_path: string
  }
}) => {
  const resultVolume = await ssh.execCommand(
    `dokku storage:unmount ${appName} ${volume.host_path}:${volume.container_path}`,
  )

  if (resultVolume.code === 1) {
    throw new Error(resultVolume.stderr)
  }

  return resultVolume
}
