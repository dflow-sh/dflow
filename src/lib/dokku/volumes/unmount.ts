import { NodeSSH } from 'node-ssh'

export const unmount = async ({
  ssh,
  appName,
  volume,
}: {
  ssh: NodeSSH
  appName: string
  volume: {
    hostPath: string
    containerPath: string
  }
}) => {
  const resultVolume = await ssh.execCommand(
    `dokku storage:unmount ${appName} /var/lib/dokku/data/storage/${appName}/${volume.hostPath}:${volume.containerPath}`,
  )

  if (resultVolume.code === 1) {
    throw new Error(resultVolume.stderr)
  }

  return resultVolume
}
