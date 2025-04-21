import LayoutClient from '../layout.client'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import TemplateDetails from '@/components/templates/TemplateDetails'
import { Button } from '@/components/ui/button'

const page = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: templates } = await payload.find({
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
        <div className='mt-4 w-full space-y-4'>
          {templates?.map(template => (
            <TemplateDetails key={template.id} template={template} />
          ))}
        </div>
      </section>
    </LayoutClient>
  )
}

export default page
