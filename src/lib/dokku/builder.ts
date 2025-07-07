import { NodeSSH, SSHExecOptions } from 'node-ssh'

/**
 * Set the build directory for a specific Dokku app.
 * @param ssh NodeSSH instance
 * @param appName Name of the Dokku app
 * @param buildDir Build directory to set (if empty or '/', resets to default)
 * @param options SSHExecOptions (optional)
 */
export async function setBuildDir({
  ssh,
  appName,
  buildDir,
  options,
}: {
  ssh: NodeSSH
  appName: string
  buildDir?: string
  options?: SSHExecOptions
}) {
  // If buildDir is empty, undefined, or '/', reset to default
  const cmd =
    !buildDir || buildDir === '/'
      ? `dokku builder:set ${appName} build-dir`
      : `dokku builder:set ${appName} build-dir ${buildDir}`

  return ssh.execCommand(cmd, options)
}

/**
 * Set the global build directory for all Dokku apps.
 * @param ssh NodeSSH instance
 * @param buildDir Build directory to set globally (if empty or '/', resets to default)
 * @param options SSHExecOptions (optional)
 */
export async function setGlobalBuildDir({
  ssh,
  buildDir,
  options,
}: {
  ssh: NodeSSH
  buildDir?: string
  options?: SSHExecOptions
}) {
  const cmd =
    !buildDir || buildDir === '/'
      ? `dokku builder:set --global build-dir`
      : `dokku builder:set --global build-dir ${buildDir}`

  return ssh.execCommand(cmd, options)
}
