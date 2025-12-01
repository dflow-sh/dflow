import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

import { Template as DFlowTemplateType } from '@dflow/core/lib/restSDK/types'
import { Template } from '@dflow/core/payload-types'

const TemplateCard = ({
  template,
}: {
  template: DFlowTemplateType | Template
}) => {
  const params = useParams()
  const searchParams = useSearchParams()
  const type = searchParams.get('tab') || 'official'
  const tenant = params?.organisation
  return (
    <div>
      <Card>
        <CardContent className='flex h-56 flex-col justify-between p-6'>
          <div>
            <Image
              unoptimized
              alt='Template Image'
              src={template?.imageUrl || '/images/favicon.ico'}
              className='h-10 w-10 rounded-md'
              width={100}
              height={100}
            />

            <div className='mt-4 space-y-1'>
              <p className='line-clamp-1 text-lg font-semibold'>
                {template?.name}
              </p>
              <p className='text-muted-foreground line-clamp-2 text-sm'>
                {template?.description}
              </p>
            </div>
          </div>

          <div className='flex items-end justify-end'>
            <Link
              href={`/${tenant}/templates/compose?templateId=${template.id}&type=${type}`}>
              <Button variant={'outline'}>Deploy</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TemplateCard
