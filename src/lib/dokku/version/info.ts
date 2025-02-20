import { NodeSSH } from 'node-ssh'

export const info = async (ssh: NodeSSH) => {
  const resultVersion = await ssh.execCommand(`dokku version`)

  if (resultVersion.code === 1) {
    console.error(resultVersion)
    // throw new Error(resultVersion.stderr)
    return 'not-installed'
  }

  if (resultVersion.code === 127) {
    console.error(resultVersion)
    // throw new Error(resultVersion.stderr)
    return 'not-installed'
  }

  const version = resultVersion.stdout.split(' ').at(-1)
  return version
}
