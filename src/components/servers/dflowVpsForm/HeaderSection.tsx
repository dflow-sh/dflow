import { VpsPlan } from '@/actions/cloud/dFlow/types'

export const HeaderSection = ({ vpsPlan }: { vpsPlan: VpsPlan }) => {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <div className='text-2xl font-bold text-foreground'>
          {vpsPlan?.name}
        </div>
        <div className='text-muted-foreground'>
          Configure your server instance
        </div>
      </div>
    </div>
  )
}
