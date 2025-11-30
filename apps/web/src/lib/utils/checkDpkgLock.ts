import { NodeSSH, SSHExecOptions } from 'node-ssh'

/**
 * Checks if dpkg is locked on the remote system.
 * Throws an error if locked, otherwise returns the execCommand result.
 */
const checkDpkgLock = async (ssh: NodeSSH, options?: SSHExecOptions) => {
  const dpkgLockCheck = await ssh.execCommand(
    'lsof /var/lib/dpkg/lock-frontend',
    options,
  )

  if (dpkgLockCheck.code === 0) {
    throw new Error(
      'dpkg is currently locked. Please wait for any ongoing package operations to complete.',
    )
  }

  return dpkgLockCheck
}

export default checkDpkgLock
