import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import Image from 'next/image'
import Link from 'next/link'

import { getTenant } from '@/lib/get-tenant'
import { Template as DFlowTemplateType } from '@/lib/restSDK/types'
import { Template } from '@/payload-types'

const TemplateCard = async ({
  template,
}: {
  template: DFlowTemplateType | Template
}) => {
  const tenant = await getTenant()
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
              href={`/${tenant}/templates/compose?templateId=${template.id}&type=official`}>
              <Button variant={'outline'}>Deploy</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TemplateCard
