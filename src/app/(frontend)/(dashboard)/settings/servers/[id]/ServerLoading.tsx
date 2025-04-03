import { Skeleton } from '@/components/ui/skeleton'

const ServerLoading = () => {
  return (
    <div className='flex h-full w-full justify-center overflow-x-hidden'>
      <div className='flex w-full max-w-6xl flex-col gap-4 p-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-2 text-2xl font-semibold'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
          </div>
        </div>

        <div className='mt-2'>
          <Skeleton className='h-10 w-40' />
        </div>

        <div className='mt-4 flex w-full gap-x-4'>
          <Skeleton className='h-96 w-2/3' />
          <Skeleton className='h-96 w-1/3' />
        </div>
      </div>
    </div>
  )
}

export default ServerLoading
