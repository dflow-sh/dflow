import { Network } from 'lucide-react'

import { VpsPlan } from '@/actions/cloud/dFlow/types'
import { Card, CardContent } from '@/components/ui/card'

export const TrafficSection = ({ vpsPlan }: { vpsPlan: VpsPlan }) => {
  return (
    <div className='mb-6'>
      <Card>
        <CardContent className='flex items-center p-4'>
          <Network className='mr-2 h-5 w-5 text-primary' />
          <div>
            <h3 className='font-semibold text-foreground'>Traffic</h3>
            <p className='text-muted-foreground'>
              <span className='font-medium'>{`${vpsPlan?.bandwidth.traffic} ${vpsPlan?.bandwidth.trafficUnit} Traffic`}</span>
              <span className='text-sm'>{` (${vpsPlan?.bandwidth.incomingUnlimited ? 'Unlimited Incoming' : ''} )`}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
