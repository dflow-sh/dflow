import { History } from 'lucide-react'
import { getAllBackupsAction } from '@dflow/core/actions/dbBackup'
import AccessDeniedAlert from '@dflow/core/components/AccessDeniedAlert'
import { BackupDetails } from '@dflow/core/components/service/Backup'
import { Backup } from '@dflow/core/payload-types'
import LayoutClient from '../layout.client'

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
