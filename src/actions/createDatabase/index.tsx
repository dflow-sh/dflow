'use server'

import { publicClient } from '@/lib/safe-action'
import { createDatabaseQueue } from '@/queues/createDatabase'

import { createDatabaseInputSchema } from './validator'

export const createDatabaseAction = publicClient
  .metadata({
    actionName: 'createDatabaseAction',
  })
  .schema(createDatabaseInputSchema)
  .action(async ({ clientInput }) => {
    const { dbName } = clientInput

    const job = await createDatabaseQueue.add('create-database', {
      databaseName: dbName,
      databaseType: 'POSTGRESQL',
      userId: '1',
    })

    return { success: true, jobId: job.id }
  })
