import { Logger } from '@logtail/next'
import { env } from 'env'

export const log = new Logger({
  source: env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
})
