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
      return `--env ${key}="${value}"`
    })
    .join(' ')

  await ssh.execCommand(`
      if [ ! "$(docker ps -aq -f name=buildkitd)" ]; then
        sudo docker run -d --name buildkitd --privileged moby/buildkit:latest
        sudo docker update --restart=unless-stopped buildkitd
      elif [ "$(docker ps -aq -f name=buildkitd -f status=exited)" ]; then
        sudo docker start buildkitd
      fi
    `)

  const resultCreateImage = await ssh.execCommand(
    `
    sudo BUILDKIT_HOST=docker-container://buildkitd railpack prepare /home/dokku/${appName}-docker --plan-out railpack-plan.json --info-out railpack-info.json ${variables} && \
    sudo BUILDKIT_HOST=docker-container://buildkitd railpack build /home/dokku/${appName}-docker ${variables}
    `,
    options,
  )

  return resultCreateImage
}
