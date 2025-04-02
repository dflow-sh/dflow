import { Skeleton } from '@/components/ui/skeleton'

const ServiceLoading = () => {
  return (
    <div className='flex h-full w-full justify-center overflow-hidden'>
      <div className='flex w-full max-w-6xl flex-col gap-4 py-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-2 text-2xl font-semibold'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
          </div>
        </div>

        <div className='mt-2 flex justify-between gap-x-4'>
          <Skeleton className='h-10 w-40' />
          <div className='flex items-center gap-x-2'>
            <Skeleton className='h-10 w-28' />
            <Skeleton className='h-10 w-28' />
            <Skeleton className='h-10 w-28' />
          </div>
        </div>

        <div className='mt-4'>
          <Skeleton className='h-[400px] w-full' />
        </div>
      </div>
    </div>
  )
}

export default ServiceLoading
