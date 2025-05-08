import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  backupFileName: string
  options?: SSHExecOptions
}

export const deleteBackup = async ({ ssh, backupFileName, options }: Args) => {
  const resultDeleteBackup = await ssh.execCommand(
    `sudo rm -rf ${backupFileName}`,
    options,
  )

  if (resultDeleteBackup.code !== 0) {
    throw new Error(`Failed to delete backup: ${resultDeleteBackup.stderr}`)
  }
  return resultDeleteBackup
}
