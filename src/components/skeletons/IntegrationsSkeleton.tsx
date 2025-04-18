import { Skeleton } from '@/components/ui/skeleton'

export const IntegrationsSkeleton = () => {
  return (
    <main className='mx-auto mb-32 w-full max-w-6xl'>
      <section>
        <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* Integration Card Skeletons - creating 3 cards */}
          {[1, 2, 3].map(item => (
            <div
              key={item}
              className='h-full rounded-xl border bg-muted/30 text-card-foreground shadow'>
              <div className='flex flex-col space-y-1.5 p-6 pb-2'>
                <div className='mb-2 flex size-14 items-center justify-center rounded-md border'>
                  <Skeleton className='size-8' /> {/* Icon skeleton */}
                </div>
                <Skeleton className='h-5 w-32' /> {/* Title skeleton */}
              </div>
              <div className='min-h-24 p-6 pt-0'>
                <Skeleton className='mb-2 h-4 w-full' />{' '}
                {/* Description line 1 */}
                <Skeleton className='h-4 w-4/5' /> {/* Description line 2 */}
              </div>
              <div className='flex items-center border-t p-6 py-4'>
                <Skeleton className='h-9 w-28' /> {/* Button skeleton */}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
