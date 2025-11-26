'use server'

import { publicClient } from "@core/lib/safe-action"

import { exampleSchema } from "@core/actions/example/validator"

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const exampleAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'exampleAction',
  })
  .inputSchema(exampleSchema)
  .action(async ({ clientInput }) => {
    const { email, name } = clientInput

    console.log({ email, name })

    return { email, name }
  })
