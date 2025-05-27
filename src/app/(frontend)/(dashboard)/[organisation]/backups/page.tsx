import LayoutClient from '../../layout.client'
import { History } from 'lucide-react'

import { getAllBackups } from '@/actions/dbBackup'
import { Backup } from '@/payload-types'

const BackupsPage = async () => {
  const result = await getAllBackups()
  const data = result?.data as Backup[]

  // console.log('Backups Data:', data)

  const grouped = data.reduce(
    (acc, backup) => {
      let projectName = ''
      let serviceName = ''

      if (typeof backup.service === 'string') {
        projectName = 'Unknown Project'
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

        <div className='space-y-8'>
          {Object.entries(grouped).map(([projectName, services]) => (
            <div key={projectName} className='rounded-xl border p-6 shadow'>
              <h4 className='mb-4 text-2xl font-semibold'>{projectName}</h4>
              <div className='ml-4 space-y-6'>
                {Object.entries(services).map(([serviceName, backups]) => (
                  <div key={serviceName}>
                    <h5 className='mb-2 text-lg font-medium text-muted-foreground'>
                      {serviceName}
                    </h5>
                    <ul className='ml-4 space-y-3'>
                      {backups.map(backup => (
                        <li
                          key={backup.id}
                          className='rounded-lg border p-4 shadow-sm'>
                          <div className='flex flex-col space-y-1 text-sm'>
                            <span>
                              <strong>Status:</strong> {backup.status}
                            </span>
                            <span>
                              <strong>Type:</strong> {backup.type}
                            </span>
                            <span>
                              <strong>Created:</strong>{' '}
                              {new Date(backup.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className='mt-10 rounded-xl p-6 text-center'>
              <h4 className='mb-4 text-2xl font-semibold'>No Backups Found</h4>
              <p className='text-muted-foreground'>
                No backups found for any projects or services.
              </p>
            </div>
          )}
        </div>
      </section>
    </LayoutClient>
  )
}

export default BackupsPage
