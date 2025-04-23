'use server'

import {
  allIntroductions,
  allOnboardings,
  allServers,
  allServices,
} from 'content-collections'

import { publicClient } from '@/lib/safe-action'

import { docsSchema } from './validator'

const allDocs = {
  introduction: allIntroductions,
  servers: allServers,
  onboarding: allOnboardings,
  services: allServices,
}

export const docsAction = publicClient
  .metadata({
    actionName: 'docsAction',
  })
  .schema(docsSchema)
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
