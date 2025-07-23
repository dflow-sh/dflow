import { NodeSSH, SSHExecOptions } from 'node-ssh'

import checkDpkgLock from '@/lib/utils/checkDpkgLock'

export const uninstall = async (ssh: NodeSSH, options?: SSHExecOptions) => {
  // Check if dpkg is locked before proceeding
  // todo: check the need for dpkg
  await checkDpkgLock(ssh, options) // returns exec result if not locked

  // Cleans up containers & images
  // todo: change to dokku method
  const cleanUp = await ssh.execCommand('dokku cleanup', options)
  console.log({ cleanUp })

  if (cleanUp.code !== 0) {
    throw new Error(cleanUp.stderr)
  }

  const dokkuUninstallResult = await ssh.execCommand(
    'sudo apt-get purge dokku herokuish -y',
    options,
  )

  console.log({ dokkuUninstallResult })

  if (dokkuUninstallResult.code !== 0) {
    throw new Error(dokkuUninstallResult.stderr)
  }

  // Removes the dokku user
  // const removeUser = await ssh.execCommand('sudo userdel -r dokku', options)
  // console.log({ removeUser })

  // if (removeUser.code !== 0) {
  //   throw new Error(removeUser.stderr)
  // }

  // // Removes the dokku group
  // const removeGroup = await ssh.execCommand('sudo groupdel dokku', options)
  // console.log({ removeGroup })

  // if (removeGroup.code !== 0) {
  //   throw new Error(removeGroup.stderr)
  // }

  // Removes the dokku home directory
  const removeDokku = [
    'sudo rm -rf ~dokku',
    'sudo rm -rf /var/lib/dokku',
    'sudo rm -rf /var/log/dokku',
    'sudo rm -rf bootstrap.sh',
  ]

  // Not parallel execution, so we can handle errors sequentially
  for (const command of removeDokku) {
    const result = await ssh.execCommand(command, options)
    console.log('Remove Dokku Command Result:', result.stdout, command)
    if (result.code !== 0) {
      throw new Error(result.stderr)
    }
  }

  return {
    dokkuUninstallResult,
  }
}
