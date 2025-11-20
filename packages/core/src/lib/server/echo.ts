import { NodeSSH } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  command: string
}

export const echo = async ({ ssh, command }: Args) => {
  const resultEcho = await ssh.execCommand(`echo ${command}`)
  return resultEcho
}
