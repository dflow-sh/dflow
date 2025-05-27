import { Camera, CircuitBoard, Cpu, HardDrive } from 'lucide-react'

import { VpsPlan } from '@/actions/cloud/dFlow/types'
import { Card, CardContent } from '@/components/ui/card'

export const SpecificationsSection = ({ vpsPlan }: { vpsPlan: VpsPlan }) => {
  return (
    <div className='mb-6 mt-6'>
      <h2 className='mb-3 text-lg font-semibold text-foreground'>
        Server Specifications
      </h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='flex h-full flex-col p-4'>
            <div className='mb-2 flex items-center space-x-2'>
              <Cpu className='h-5 w-5 text-primary' />
              <h3 className='font-semibold text-foreground'>CPU</h3>
            </div>
            <p className='text-muted-foreground'>
              {`${vpsPlan?.cpu.cores} ${vpsPlan?.cpu.type === 'virtual' ? 'vCPU' : 'CPU'} Cores`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='flex h-full flex-col p-4'>
            <div className='mb-2 flex items-center space-x-2'>
              <CircuitBoard className='h-5 w-5 text-primary' />
              <h3 className='font-semibold text-foreground'>RAM</h3>
            </div>
            <p className='text-muted-foreground'>
              {`${vpsPlan?.ram.size} ${vpsPlan?.ram.unit} RAM`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='flex h-full flex-col p-4'>
            <div className='mb-2 flex items-center space-x-2'>
              <HardDrive className='h-5 w-5 text-primary' />
              <h3 className='font-semibold text-foreground'>Storage</h3>
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
              <Camera className='h-5 w-5 text-primary' />
              <h3 className='font-semibold text-foreground'>Snapshot</h3>
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
