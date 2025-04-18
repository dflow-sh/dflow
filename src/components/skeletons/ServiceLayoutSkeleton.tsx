import { Skeleton } from '@/components/ui/skeleton'

export const ServiceLayoutSkeleton = () => {
  return (
    <div className='w-full'>
      <div className='sticky top-[68px] z-40 bg-background'>
        <div
          className='mx-auto w-full max-w-6xl overflow-x-scroll'
          style={{ scrollbarWidth: 'none' }}>
          <div className='flex w-full items-center rounded-none border-none bg-transparent shadow-none'>
            <div className='w-full p-0'>
              <div className='relative'>
                <div className='absolute bottom-[-5.5px] h-[1px] w-full bg-border'></div>
                <div className='absolute bottom-[-6px] h-[2px] w-16 rounded-full bg-foreground'></div>
                <div className='relative flex items-center space-x-[6px]'>
                  {/* Generate 5 tab skeletons */}
                  {[...Array(5)].map((_, index) => (
                    <Skeleton key={index} className='h-[30px] w-24 px-3 py-2' />
                  ))}
                </div>
              </div>
              <div className='mt-6'></div>
            </div>
          </div>
        </div>
        <div className='absolute bottom-[18.5px] z-[-10] h-[1px] w-full bg-border'></div>
      </div>
      <main className='mx-auto mb-10 mt-4 w-full max-w-6xl'>
        <div className='mb-6 md:flex md:justify-between md:gap-x-2'>
          <div>
            <div className='flex items-center gap-2'>
              <Skeleton className='size-6 rounded-full' />
              <Skeleton className='h-8 w-40' />
            </div>
            <Skeleton className='mt-1 h-4 w-64' />
          </div>
          <div className='mt-6 flex gap-x-2 md:mt-0'>
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-9 w-24' />
          </div>
        </div>

        <div className='space-y-4 rounded bg-muted/30 p-4'>
          <div>
            <Skeleton className='h-6 w-24' />
            <Skeleton className='mt-1 h-4 w-64' />
          </div>

          <Skeleton className='h-[500px] w-full rounded-md' />
        </div>
      </main>
    </div>
  )
}
