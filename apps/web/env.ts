import { env as core } from '@dflow/core/env'
import { createEnv } from '@t3-oss/env-nextjs'

export const env = createEnv({
  extends: [core],
  server: {},
  client: {},
  runtimeEnv: {},
})
