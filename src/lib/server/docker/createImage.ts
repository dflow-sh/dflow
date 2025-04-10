import { NodeSSH, SSHExecOptions } from 'node-ssh'

interface Args {
  ssh: NodeSSH
  appName: string
  options: SSHExecOptions
  environmentVariables?: Record<string, unknown>
}

export const createImage = async ({
  appName,
  options,
  ssh,
  environmentVariables,
}: Args) => {
  const variables = Object.entries(environmentVariables ?? {})
    .map(([key, value]) => {
      const formattedValue =
        value && typeof value === 'object' && 'value' in value
          ? value.value
          : value

      return `--env ${key}="${formattedValue}"`
    })
    .join(' ')

  const resultCreateImage = await ssh.execCommand(
    `
    sudo BUILDKIT_HOST=docker-container://buildkitd railpack prepare /home/dokku/${appName}-docker --plan-out railpack-plan.json --info-out railpack-info.json ${variables} && \
    sudo BUILDKIT_HOST=docker-container://buildkitd railpack build /home/dokku/${appName}-docker ${variables}
    `,
    options,
  )

  return resultCreateImage
}
