import { NodeSSH } from 'node-ssh'

export const dynamicSSH = async ({
  host,
  port,
  username,
  privateKey,
}: {
  host: string
  port: number
  username: string
  privateKey: string
}) => {
  const ssh = new NodeSSH()

  await ssh.connect({
    host,
    port,
    username,
    privateKey,
  })

  return ssh
}
