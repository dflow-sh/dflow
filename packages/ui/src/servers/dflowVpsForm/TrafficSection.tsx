import { Network } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { VpsPlan } from '@/lib/restSDK/types'

export const TrafficSection = ({ vpsPlan }: { vpsPlan: VpsPlan }) => {
  return (
    <div className='mb-6'>
      <Card>
        <CardContent className='flex items-center p-4'>
          <Network className='text-primary mr-2 h-5 w-5' />
          <div>
            <h3 className='text-foreground font-semibold'>Traffic</h3>
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
