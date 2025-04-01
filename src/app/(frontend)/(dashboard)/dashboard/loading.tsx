import { Skeleton } from '@/components/ui/skeleton'

const DashboardLoading = () => {
  return (
    <div className='-mt-64 flex h-full w-full items-center justify-center'>
      <div className='flex w-full max-w-6xl flex-col gap-4 p-4'>
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
          <Skeleton className='h-10 w-40' />
        </div>

        <div className='mt-4 flex h-full w-full items-center gap-x-4'>
          <Skeleton className='h-48 w-96' />
          <Skeleton className='h-48 w-96' />
          <Skeleton className='h-48 w-96' />
        </div>
      </div>
    </div>
  )
}

export default DashboardLoading
