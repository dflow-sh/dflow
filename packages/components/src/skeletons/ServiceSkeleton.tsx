import { Skeleton } from '@dflow/components/ui/skeleton'
import { cn } from '@dflow/lib/utils'

export const Service = () => {
  return (
    <main className='mb-10 w-full'>
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

const ServiceSkeleton = () => {
  return (
    <div
      className={cn(
        'fixed right-4 top-[9.5rem] z-50 flex h-[calc(100vh-5rem)] w-3/4 min-w-[calc(100%-30px)] flex-col overflow-hidden rounded-md border-l border-t border-border bg-background px-6 shadow-lg transition ease-in-out sm:max-w-sm md:right-0 md:min-w-[64%] lg:min-w-[55%]',
      )}>
      <div className='mt-24' />
      <div className='border-base-content/40 my-4 w-full border-b' />
      <Service />
    </div>
  )
}
export default ServiceSkeleton
