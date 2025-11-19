import { Camera, CircuitBoard, Cpu, HardDrive } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { VpsPlan } from '@/lib/restSDK/types'

export const SpecificationsSection = ({ vpsPlan }: { vpsPlan: VpsPlan }) => {
  return (
    <div className='mt-6 mb-6'>
      <h2 className='text-foreground mb-3 text-lg font-semibold'>
        Server Specifications
      </h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='flex h-full flex-col p-4'>
            <div className='mb-2 flex items-center space-x-2'>
              <Cpu className='text-primary h-5 w-5' />
              <h3 className='text-foreground font-semibold'>CPU</h3>
            </div>
            <p className='text-muted-foreground'>
              {`${vpsPlan?.cpu.cores} ${vpsPlan?.cpu.type === 'virtual' ? 'vCPU' : 'CPU'} Cores`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='flex h-full flex-col p-4'>
            <div className='mb-2 flex items-center space-x-2'>
              <CircuitBoard className='text-primary h-5 w-5' />
              <h3 className='text-foreground font-semibold'>RAM</h3>
            </div>
            <p className='text-muted-foreground'>
              {`${vpsPlan?.ram.size} ${vpsPlan?.ram.unit} RAM`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='flex h-full flex-col p-4'>
            <div className='mb-2 flex items-center space-x-2'>
              <HardDrive className='text-primary h-5 w-5' />
              <h3 className='text-foreground font-semibold'>Storage</h3>
            </div>
            <p className='text-muted-foreground'>
              {vpsPlan?.storageOptions
                ?.map(s => `${s.size} ${s.unit} ${s.type}`)
                .join(' or ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='flex h-full flex-col p-4'>
            <div className='mb-2 flex items-center space-x-2'>
              <Camera className='text-primary h-5 w-5' />
              <h3 className='text-foreground font-semibold'>Snapshot</h3>
            </div>
            <p className='text-muted-foreground'>
              {`${vpsPlan?.snapshots} ${vpsPlan?.snapshots === 1 ? 'Snapshot' : 'Snapshots'}`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
