import LayoutClient from '../layout.client'
import configPromise from '@payload-config'
import { Puzzle } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

import TemplateDetails from '@/components/templates/TemplateDetails'
import { Button } from '@/components/ui/button'

const page = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs: templates, totalDocs } = await payload.find({
    collection: 'templates',
    pagination: false,
  })

  return (
    <LayoutClient>
      <section>
        <div className='flex w-full justify-between'>
          <h3 className='text-2xl font-semibold'>Templates</h3>
          <Link href={'/templates/create'}>
            <Button>Create Template</Button>
          </Link>
        </div>

        {totalDocs > 0 ? (
          <div className='mt-4 w-full space-y-4'>
            {templates?.map(template => (
              <TemplateDetails key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className='flex-co flex h-[50vh] w-full flex-col items-center justify-center space-y-2'>
            <Puzzle
              strokeWidth={1}
              size={62}
              className='text-muted-foreground opacity-50'
            />
            <p className='text-muted-foreground'>No Templates founds</p>
          </div>
        )}
      </section>
    </LayoutClient>
  )
}

export default page
