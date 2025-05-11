import LayoutClient from '../../layout.client'
import { Puzzle } from 'lucide-react'
import Link from 'next/link'

import { getTemplates } from '@/actions/pages/Template'
import TemplateDetails from '@/components/templates/TemplateDetails'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ organisation: string }>
}

const page = async ({ params }: PageProps) => {
  const syncParams = await params
  const templates = await getTemplates()

  return (
    <LayoutClient>
      <section>
        <div className='flex w-full justify-between'>
          <h3 className='text-2xl font-semibold'>Templates</h3>
          <Link href={`/${syncParams.organisation}/templates/compose`}>
            <Button>Create Template</Button>
          </Link>
        </div>

        {templates?.data?.length! > 0 ? (
          <div className='mt-4 w-full space-y-4'>
            {templates?.data?.map(template => (
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
