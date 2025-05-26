import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import Image from 'next/image'

import { Template } from '@/payload-types'

const TemplateCard = ({ template }: { template: Template }) => {
  console.log({ template })
  return (
    <Card>
      <CardContent className='p-6'>
        <Image
          alt={`icon`}
          src={template?.imageUrl || '/images/favicon.ico'}
          height={32}
          width={32}
          className='size-8'
        />

        <div className='mt-4 flex flex-col gap-1'>
          <p className='line-clamp-1 text-lg font-semibold'>{template?.name}</p>
          <p className='line-clamp-2 text-sm text-muted-foreground'>
            {template?.description}
          </p>
        </div>

        <div className='mt-6 flex justify-end'>
          <Button variant='outline'>Deploy</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TemplateCard
