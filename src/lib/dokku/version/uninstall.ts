import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const uninstall = async (ssh: NodeSSH, options?: SSHExecOptions) => {
  const dpkgLockCheck = await ssh.execCommand(
    'lsof /var/lib/dpkg/lock-frontend',
    options,
  )

  if (dpkgLockCheck.code === 0) {
    throw new Error(
      'dpkg is currently locked. Please wait for any ongoing package operations to complete.',
    )
  }

  const dokkuUninstallResult = await ssh.execCommand(
    'sudo apt-get purge dokku herokuish -y',
    options,
  )

  if (dokkuUninstallResult.code !== 0) {
    throw new Error(dokkuUninstallResult.stderr)
  }

  // Cleans up containers & images
  const cleanUp = await ssh.execCommand('dokku cleanup', options)

  if (cleanUp.code !== 0) {
    throw new Error(cleanUp.stderr)
  }

  // Removes the dokku user
  const removeUser = await ssh.execCommand('sudo userdel -r dokku', options)

  if (removeUser.code !== 0) {
    throw new Error(removeUser.stderr)
  }

  // Removes the dokku group
  const removeGroup = await ssh.execCommand('sudo groupdel dokku', options)

  if (removeGroup.code !== 0) {
    throw new Error(removeGroup.stderr)
  }

  // Removes the dokku home directory
  const removeDokku = [
    'sudo rm -rf /home/dokku',
    'sudo rm -rf /var/lib/dokku',
    'sudo rm -rf /var/log/dokku',
  ]

  const removeDokkuResult = await ssh.execCommand(
    removeDokku.join(' && '),
    options,
  )

  if (removeDokkuResult.code !== 0) {
    throw new Error(removeDokkuResult.stderr)
  }
  return {
    dokkuUninstallResult,
  }
}
