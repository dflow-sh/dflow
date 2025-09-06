import { NodeSSH } from 'node-ssh'

export const mount = async ({
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
  await ssh.execCommand(`dokku storage:ensure-directory ${appName}`)

  const resultVolume = await ssh.execCommand(
    `dokku storage:mount ${appName} /${volume.hostPath}:${volume.containerPath}`,
  )

  if (resultVolume.code === 1) {
    throw new Error(resultVolume.stderr)
  }

  return resultVolume
}
