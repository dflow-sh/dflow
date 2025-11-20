import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const checkInstalled = async ({
  ssh,
  options,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
}) => {
  // Check if the netdata systemd service exists
  const serviceCheck = await ssh.execCommand(
    '[ -f /etc/systemd/system/netdata.service ] || [ -f /lib/systemd/system/netdata.service ] && echo "exists" || echo ""',
    options,
  )

  // Check if netdata binary exists
  const binaryCheck = await ssh.execCommand(
    'command -v netdata || find /usr/sbin /usr/local/sbin /opt/netdata/bin -name netdata 2>/dev/null',
    options,
  )

  // Check if netdata process is running
  const processCheck = await ssh.execCommand(
    'pgrep -x netdata || (ps aux | grep -w "[n]etdata" | grep -E "/usr/sbin/netdata|/usr/local/sbin/netdata" | grep -v grep)',
    options,
  )

  // Debugging output
  console.log({
    serviceCheck: serviceCheck.stdout.trim(),
    binaryCheck: binaryCheck.stdout.trim(),
    processCheck: processCheck.stdout.trim(),
  })

  // Get version
  const versionCheck = await ssh.execCommand(
    'netdata -v 2>/dev/null || netdata -V 2>/dev/null || cat /etc/netdata/netdata.conf 2>/dev/null | grep -m1 version || cat /opt/netdata/version.txt 2>/dev/null || echo ""',
    options,
  )

  const isInstalled = Boolean(
    serviceCheck.stdout.trim() ||
      binaryCheck.stdout.trim() ||
      processCheck.stdout.trim(),
  )

  return {
    isInstalled,
    version: versionCheck.stdout.trim() || null,
    servicePath: serviceCheck.stdout.trim() || null,
    binaryPath: binaryCheck.stdout.trim() || null,
  }
}
