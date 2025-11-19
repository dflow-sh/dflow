import { VpsPlan } from '@/lib/restSDK/types'

export const HeaderSection = ({ vpsPlan }: { vpsPlan: VpsPlan }) => {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <div className='text-foreground text-2xl font-bold'>
          {vpsPlan?.name}
        </div>
        <div className='text-muted-foreground'>
          Configure your server instance
        </div>
      </div>
    </div>
  )
}
