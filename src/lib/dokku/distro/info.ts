import { NodeSSH } from 'node-ssh'

export const info = async (ssh: NodeSSH) => {
  const resultDistro = await ssh.execCommand(`lsb_release -a`)

  if (resultDistro.code === 1) {
    console.error(resultDistro)
  }

  const version = resultDistro.stdout.trim()

  return version
}
