import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'
import { z } from 'zod'

import { setServiceNginxConfigSchema } from '@dflow/core/actions/service/validator'

type NginxKey = z.infer<typeof setServiceNginxConfigSchema>

export const set = async ({
  ssh,
  appName,
  options,
  key,
  value,
}: {
  ssh: NodeSSH
  appName: string
  key: NginxKey['key']
  value: string
  options?: SSHExecCommandOptions
}) => {
  const resultSet = await ssh.execCommand(
    `dokku nginx:set ${appName} ${key} ${value}`,
    options,
  )

  if (resultSet.code === 1) {
    throw new Error(resultSet.stderr)
  }

  return { success: true, output: resultSet }
}
