import LayoutClient from '../layout.client'
import { History } from 'lucide-react'

import { getAllBackups } from '@/actions/dbBackup'
import { IndividualBackup } from '@/components/service/Backup'
import { Backup } from '@/payload-types'

const BackupsPage = async () => {
  const result = await getAllBackups()
  const data = result?.data as Backup[]

  const grouped = data.reduce(
    (acc, backup) => {
      let projectName = ''
      let serviceName = ''

      if (typeof backup.service === 'string') {
        projectName = 'Deleted Project/Service'
        serviceName = backup.service
      } else {
        projectName =
          typeof backup.service !== 'string'
            ? backup.service.project &&
              typeof backup.service.project !== 'string'
              ? backup.service.project.name || 'Unknown Project'
              : 'Unknown Project'
            : 'Unknown Project'
        serviceName =
          typeof backup.service !== 'string'
            ? backup.service.name
            : backup.service
      }

      if (!acc[projectName]) acc[projectName] = {}
      if (!acc[projectName][serviceName]) acc[projectName][serviceName] = []

      acc[projectName][serviceName].push(backup)
      return acc
    },
    {} as Record<string, Record<string, Backup[]>>,
  )

  return (
    <LayoutClient>
      <section>
        <div className='inline-flex items-center gap-2 text-2xl font-semibold'>
          <History />
          <h3>Backups</h3>
        </div>

        <div className='mt-4 space-y-4'>
          {Object.entries(grouped).map(([projectName, services]) => (
            <div key={projectName} className='rounded-xl border p-6 shadow'>
              <h4 className='mb-4 text-2xl font-semibold'>{projectName}</h4>
              <div className='space-y-6'>
                {Object.entries(services).map(([serviceName, backups]) => (
                  <div key={serviceName}>
                    <h5 className='mb-2 text-lg font-medium text-muted-foreground'>
                      {serviceName}
                    </h5>
                    <ul className='space-y-3'>
                      {backups.map(backup => (
                        <IndividualBackup
                          key={backup.id}
                          showRestoreIcon={false}
                          showDeleteIcon={false}
                          backup={backup}
                          serviceId={
                            typeof backup.service === 'string'
                              ? backup.service
                              : backup.service.id
                          }
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className='rounded-lg border bg-muted/20 py-12 text-center'>
              <div className='grid min-h-[40vh] place-items-center'>
                <div className='max-w-md space-y-4 text-center'>
                  <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                    <History className='h-8 w-8 animate-pulse text-muted-foreground' />
                  </div>
                  <h2 className='text-2xl font-semibold'>No Backups Found</h2>
                  <p className='text-muted-foreground'>
                    You don’t have any backups yet. Backups for your projects or
                    services will appear here once they’re created.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </LayoutClient>
  )
}

export default BackupsPage
