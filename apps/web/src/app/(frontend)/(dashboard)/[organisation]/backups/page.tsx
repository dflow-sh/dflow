import LayoutClient from '../layout.client'
import { History } from 'lucide-react'

import { getAllBackupsAction } from '@dflow/actions/dbBackup'
import AccessDeniedAlert from '@dflow/components/AccessDeniedAlert'
import { BackupDetails } from '@dflow/components/service/Backup'
import { Backup } from '@/payload-types'

const BackupsPage = async () => {
  const result = await getAllBackupsAction()
  const data = result?.data as Backup[]

  return (
    <LayoutClient>
      <section>
        <div className='inline-flex items-center gap-2 pb-4 text-2xl font-semibold'>
          <History />
          <h3>Backups</h3>
        </div>

        {result?.serverError ? (
          <AccessDeniedAlert error={result?.serverError} />
        ) : (
          <BackupDetails data={data} />
        )}
      </section>
    </LayoutClient>
  )
}

export default BackupsPage
