import { NodeSSH, SSHExecOptions } from 'node-ssh'

export const createWettyConfig = async (
  ssh: NodeSSH,
  configPath: string,
  configContent: string,
  options?: SSHExecOptions,
) => {
  // Ensure directory exists
  await ssh.execCommand(`mkdir -p ${configPath}`, options)

  // Write config file
  const result = await ssh.execCommand(
    `cat > ${configPath}/.wetty.json << 'EOF'
${configContent}
EOF`,
    options,
  )

  if (result.code === 1) {
    throw new Error(result.stderr)
  }

  return result
}
