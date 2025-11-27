'use server'

import { docsSchema } from '@core/actions/docs/validator'
import { allDocs } from '@core/docs'
import { publicClient } from '@core/lib/safe-action'

export const docsAction = publicClient
  .metadata({
    actionName: 'docsAction',
  })
  .inputSchema(docsSchema)
  .action(async ({ clientInput }) => {
    const { directory, fileName } = clientInput

    const docs = allDocs[directory as keyof typeof allDocs]

    if (!docs) {
      throw new Error('Documentation not found')
    }

    const docFile = docs.find(d => d._meta.fileName === `${fileName}.md`)

    if (!docFile) {
      throw new Error('Document file not found')
    }

    return docFile
  })
