import LayoutClient from '../layout.client'
import { Plus, Puzzle } from 'lucide-react'
import Link from 'next/link'

import { getCloudProvidersAccountsAction } from '@dflow/actions/cloud'
import {
  getAllOfficialTemplatesAction,
  getPersonalTemplatesAction,
} from '@dflow/actions/templates'
import Templates from '@dflow/components/templates/Templates'
import { Button } from '@dflow/components/ui/button'

interface PageProps {
  params: Promise<{ organisation: string }>
}

const page = async ({ params }: PageProps) => {
  const syncParams = await params
  const personalTemplates = await getPersonalTemplatesAction({
    type: 'personal',
  })
  const officialTemplates = await getAllOfficialTemplatesAction({
    type: 'official',
  })
  const communityTemplates = await getAllOfficialTemplatesAction({
    type: 'community',
  })

  const accounts = await getCloudProvidersAccountsAction({
    type: 'dFlow',
  })

  return (
    <LayoutClient>
      <section>
        <div className='flex w-full justify-between'>
          <div className='inline-flex items-center gap-2 text-2xl font-semibold'>
            <Puzzle />
            <h3>Templates</h3>
          </div>

          <Button asChild className='w-min'>
            <Link
              href={`/${syncParams.organisation}/templates/compose?type=personal`}
              className='flex items-center gap-2'>
              <Plus />
              Create Template
            </Link>
          </Button>
        </div>

        <Templates
          accounts={accounts?.data}
          communityTemplates={communityTemplates?.data}
          officialTemplates={officialTemplates?.data}
          personalTemplates={personalTemplates?.data}
          serverError={personalTemplates?.serverError}
        />
      </section>
    </LayoutClient>
  )
}

export default page
