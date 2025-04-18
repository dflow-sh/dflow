import { Skeleton } from '@/components/ui/skeleton'

export const SecuritySkeleton = () => {
  return (
    <main className='mx-auto mb-32 w-full max-w-6xl'>
      {/* Tab List */}
      <div className='w-full'>
        <div className='mb-4 grid h-9 w-full max-w-md grid-cols-2 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground'>
          <div className='flex h-7 items-center justify-center gap-2 rounded-md bg-background px-3 shadow'>
            <Skeleton className='h-4 w-4' /> {/* Tab icon */}
            <Skeleton className='h-4 w-16' /> {/* Tab text */}
            <Skeleton className='ml-1 h-4 w-6 rounded-md' /> {/* Count badge */}
          </div>
          <div className='flex h-7 items-center justify-center gap-2'>
            <Skeleton className='h-4 w-4' /> {/* Tab icon */}
            <Skeleton className='h-4 w-24' /> {/* Tab text */}
            <Skeleton className='ml-1 h-4 w-6 rounded-md' /> {/* Count badge */}
          </div>
        </div>

        {/* Tab Panel Content */}
        <div className='mt-4'>
          {/* Card container */}
          <div className='rounded-xl border bg-muted/30 text-card-foreground shadow'>
            <div className='flex flex-col space-y-1.5 p-6'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-8 w-32' /> {/* Card title */}
                <Skeleton className='h-9 w-32' /> {/* Add button */}
              </div>
              <Skeleton className='h-4 w-full max-w-md' />{' '}
              {/* Card description */}
            </div>

            <div className='p-6 pt-0'>
              <div className='mt-4 w-full space-y-4'>
                {/* SSH Key Item 1 */}
                <div className='rounded-xl border bg-muted/30 text-card-foreground shadow'>
                  <div className='flex h-24 w-full items-center justify-between gap-3 p-6 pt-4'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-8 w-8 rounded-full' /> {/* Icon */}
                      <div>
                        <Skeleton className='mb-1 h-5 w-24' /> {/* Key name */}
                        <Skeleton className='h-4 w-32' />{' '}
                        {/* Key description */}
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-9 w-9 rounded-md' />{' '}
                      {/* Edit button */}
                      <Skeleton className='h-9 w-9 rounded-md' />{' '}
                      {/* Delete button */}
                    </div>
                  </div>
                </div>

                {/* SSH Key Item 2 */}
                <div className='rounded-xl border bg-muted/30 text-card-foreground shadow'>
                  <div className='flex h-24 w-full items-center justify-between gap-3 p-6 pt-4'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-8 w-8 rounded-full' /> {/* Icon */}
                      <div>
                        <Skeleton className='mb-1 h-5 w-20' /> {/* Key name */}
                        <Skeleton className='h-4 w-16' />{' '}
                        {/* Key description */}
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-9 w-9 rounded-md' />{' '}
                      {/* Edit button */}
                      <Skeleton className='h-9 w-9 rounded-md' />{' '}
                      {/* Delete button */}
                    </div>
                  </div>
                </div>

                {/* SSH Key Item 3 */}
                <div className='rounded-xl border bg-muted/30 text-card-foreground shadow'>
                  <div className='flex h-24 w-full items-center justify-between gap-3 p-6 pt-4'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-8 w-8 rounded-full' /> {/* Icon */}
                      <div>
                        <Skeleton className='mb-1 h-5 w-28' /> {/* Key name */}
                        <Skeleton className='h-4 w-40' />{' '}
                        {/* Key description */}
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-9 w-9 rounded-md' />{' '}
                      {/* Edit button */}
                      <Skeleton className='h-9 w-9 rounded-md' />{' '}
                      {/* Delete button */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
