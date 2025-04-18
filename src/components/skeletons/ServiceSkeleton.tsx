import { Skeleton } from '@/components/ui/skeleton'

export const ServiceSkeleton = () => {
  return (
    <main className='mx-auto mb-10 mt-4 w-full max-w-6xl'>
      <div className='space-y-4 rounded bg-muted/30 p-4'>
        <div>
          <Skeleton className='h-6 w-24' />
          <Skeleton className='mt-1 h-4 w-64' />
        </div>

        <div className='w-full text-card-foreground'>
          <div className='w-full p-0'>
            <div className='relative'>
              <div className='relative flex items-center space-x-2'>
                <Skeleton className='h-8 w-20' />
                <Skeleton className='h-8 w-20' />
                <Skeleton className='h-8 w-20' />
              </div>
            </div>

            <div className='mt-6'>
              <div className='w-full space-y-6'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-9 w-full' />
                </div>

                <div className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-9 w-full' />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-9 w-full' />
                  </div>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-9 w-full' />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Skeleton className='h-4 w-12' />
                  <Skeleton className='h-9 w-full' />
                </div>

                <div className='space-y-2'>
                  <Skeleton className='h-4 w-16' />
                  <div className='flex w-full flex-col gap-4 md:flex-row'>
                    <Skeleton className='h-24 w-full' />
                    <Skeleton className='h-24 w-full' />
                  </div>
                </div>

                <div className='flex w-full justify-end'>
                  <Skeleton className='h-9 w-20' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
