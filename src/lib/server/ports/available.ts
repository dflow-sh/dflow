import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'

export const available = async ({
  ssh,
  options,
  length = 1,
}: {
  ssh: NodeSSH
  options?: SSHExecCommandOptions
  length: number
}) => {
  const ports = Array.from(Array(length).keys())
  const resultAvailablePorts = await ssh.execCommand(
    `get_random_free_port() {
  while true; do
    port=$((RANDOM % 55512 + 10000)) # range: 10000–65535

    # Check if the port is already in use
    if ! netstat -lnt | awk '{print $4}' | grep -q ":$port\$"; then
      echo "$port"
      return
    fi
  done
}

echo "${ports.map(() => `$(get_random_free_port)`).join(' ')}"
`,
    options,
  )

  if (resultAvailablePorts.code === 0) {
    return resultAvailablePorts.stdout.trim().split(/\s+/)
  } else {
    throw new Error(resultAvailablePorts.stderr || 'Failed to get ports')
  }
}
