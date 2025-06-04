import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import Image from 'next/image'

import { Template } from '@/payload-types'

const TemplateCard = ({ template }: { template: Template }) => {
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
              <p className='line-clamp-2 text-sm text-muted-foreground'>
                {template?.description}
              </p>
            </div>
          </div>

          <div className='mt-6 flex items-end justify-end'>
            <Button variant='outline'>Deploy</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TemplateCard
