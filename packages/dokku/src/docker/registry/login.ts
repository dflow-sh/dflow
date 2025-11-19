import { NodeSSH, SSHExecOptions } from 'node-ssh'

import { DockerRegistry } from '@/payload-types'

type RegistryType = DockerRegistry['type']

interface Args {
  ssh: NodeSSH
  options?: SSHExecOptions
  type: RegistryType
  username: string
  password: string
}

const registryMapping: { [key in RegistryType]: string } = {
  docker: 'docker.io',
  digitalocean: 'registry.digitalocean.com',
  github: 'ghcr.io',
  quay: 'quay.io',
}

export const login = async ({
  type,
  ssh,
  options,
  username,
  password,
}: Args) => {
  const resultLogin = await ssh.execCommand(
    `dokku registry:login ${registryMapping[type]} "${username}" "${password}"`,
    options,
  )

  return resultLogin
}
