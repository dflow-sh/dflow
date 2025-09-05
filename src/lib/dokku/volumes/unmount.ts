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
    volume_options?: string
  }
}) => {
  const { container_path, host_path, volume_options = '' } = volume
  const resultVolume = await ssh.execCommand(
    `dokku storage:unmount ${appName} ${host_path}:${container_path}${volume_options ? `:${volume_options}` : ''}`,
  )

  if (resultVolume.code === 1) {
    throw new Error(resultVolume.stderr)
  }

  return resultVolume
}
