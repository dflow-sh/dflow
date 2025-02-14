import { NodeSSH } from 'node-ssh'

export const sshConnect = async () => {
  const ssh = new NodeSSH()

  await ssh.connect({
    host: process.env.DOKKU_SSH_HOST,
    port: 22,
    username: 'root',
    privateKey: process.env.PRIVATE_KEY,
  })

  return ssh
}

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
