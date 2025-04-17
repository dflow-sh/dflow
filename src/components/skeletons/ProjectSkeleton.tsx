import { Skeleton } from '@/components/ui/skeleton'

export const ProjectSkeleton = () => {
  return (
    <main className='mx-auto mb-32 w-full max-w-6xl'>
      <section>
        <div className='flex w-full justify-between'>
          <div>
            <Skeleton className='mb-2 h-8 w-48' />
            <Skeleton className='h-4 w-32' />
          </div>
          <Skeleton className='h-9 w-36' />
        </div>

        <div className='mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* Generate 6 skeleton card placeholders */}
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className='h-full min-h-36 rounded-xl border bg-muted/30 text-card-foreground shadow'>
                <div className='flex w-full flex-row justify-between space-y-1.5 p-6'>
                  <div className='flex items-center gap-x-3'>
                    <Skeleton className='size-6 rounded-full' />
                    <div className='flex-1 items-start'>
                      <Skeleton className='mb-2 h-5 w-32' />
                      <Skeleton className='h-4 w-24' />
                    </div>
                  </div>
                  <Skeleton className='h-9 w-9 flex-shrink-0 rounded-md' />
                </div>
                <div className='flex items-center p-6 pt-0'>
                  <Skeleton className='h-4 w-36' />
                </div>
              </div>
            ))}
        </div>
      </section>
    </main>
  )
}
