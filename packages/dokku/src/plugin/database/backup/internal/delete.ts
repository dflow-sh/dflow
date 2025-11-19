import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  backupFileName: string[]
  options?: SSHExecOptions
}

export const deleteBackup = async ({ ssh, backupFileName, options }: Args) => {
  const escapedFilenames = backupFileName.map(name => `'${name}'`).join(' ')
  // TODO: backup name should always have dflow-backup in it
  // ensure before executing rm -rf, check if it has dflow-backup

  const resultDeleteBackup = await ssh.execCommand(
    `sudo rm -rf ${escapedFilenames}`,
    options,
  )

  if (resultDeleteBackup.code !== 0) {
    throw new Error(`Failed to delete backup: ${resultDeleteBackup.stderr}`)
  }
  return resultDeleteBackup
}
