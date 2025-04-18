import { Skeleton } from '@/components/ui/skeleton'

export const ServersSkeleton = () => {
  return (
    <main className='mx-auto mb-32 w-full max-w-6xl'>
      {/* Server Grid */}
      <div className='grid gap-4 md:grid-cols-3'>
        {/* Server Card 1 */}
        <div className='h-full'>
          <div className='h-full min-h-36 rounded-xl border bg-muted/30 text-card-foreground shadow transition-colors duration-300'>
            <div className='flex w-full flex-row items-start justify-between space-y-1.5 p-6'>
              <div>
                <div className='flex items-center gap-2 font-semibold leading-none tracking-tight'>
                  <Skeleton className='h-6 w-6 rounded-full' />{' '}
                  {/* Server icon */}
                  <Skeleton className='h-5 w-24' /> {/* Server name */}
                </div>
                <div className='mt-2'>
                  <Skeleton className='h-4 w-32' /> {/* Server description */}
                </div>
              </div>
              <Skeleton className='h-9 w-9 rounded-md' /> {/* Action button */}
            </div>
            <div className='p-6 pt-0'>
              <Skeleton className='h-5 w-32' /> {/* IP Address */}
            </div>
          </div>
        </div>

        {/* Server Card 2 */}
        <div className='h-full'>
          <div className='h-full min-h-36 rounded-xl border bg-muted/30 text-card-foreground shadow transition-colors duration-300'>
            <div className='flex w-full flex-row items-start justify-between space-y-1.5 p-6'>
              <div>
                <div className='flex items-center gap-2 font-semibold leading-none tracking-tight'>
                  <Skeleton className='h-6 w-6 rounded-full' />{' '}
                  {/* Server icon */}
                  <Skeleton className='h-5 w-28' /> {/* Server name */}
                </div>
                <div className='mt-2'>
                  <Skeleton className='h-4 w-40' /> {/* Server description */}
                </div>
              </div>
              <Skeleton className='h-9 w-9 rounded-md' /> {/* Action button */}
            </div>
            <div className='p-6 pt-0'>
              <Skeleton className='h-5 w-32' /> {/* IP Address */}
            </div>
          </div>
        </div>

        {/* Server Card 3 */}
        <div className='h-full'>
          <div className='h-full min-h-36 rounded-xl border bg-muted/30 text-card-foreground shadow transition-colors duration-300'>
            <div className='flex w-full flex-row items-start justify-between space-y-1.5 p-6'>
              <div>
                <div className='flex items-center gap-2 font-semibold leading-none tracking-tight'>
                  <Skeleton className='h-6 w-6 rounded-full' />{' '}
                  {/* Server icon */}
                  <Skeleton className='h-5 w-20' /> {/* Server name */}
                </div>
                <div className='mt-2'>
                  <Skeleton className='h-4 w-36' /> {/* Server description */}
                </div>
              </div>
              <Skeleton className='h-9 w-9 rounded-md' /> {/* Action button */}
            </div>
            <div className='p-6 pt-0'>
              <Skeleton className='h-5 w-32' /> {/* IP Address */}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export const CreateServerButtonSkeleton = () => {
  return <Skeleton className='h-9 w-32 rounded-md' aria-hidden='true' />
}
