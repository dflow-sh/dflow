import { Folder } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

export const DashboardSkeleton = () => {
  return (
    <main className='mx-auto mb-32 w-full max-w-6xl'>
      <section className='space-y-6'>
        {/* Header with title and create button */}
        <div className='flex items-center justify-between'>
          <div className='inline-flex items-center gap-1.5 text-2xl font-semibold'>
            <Folder />
            Projects
          </div>
          <Skeleton className='h-9 w-36 rounded-md' />
        </div>

        {/* Grid of project cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* Render 6 skeleton project cards */}
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <SkeletonProjectCard key={i} />
            ))}
        </div>
      </section>

      {/* Console button at bottom */}
      <Skeleton className='fixed bottom-0 right-0 z-50 flex h-10 w-full items-center justify-between border-t bg-secondary/50 px-3 py-2' />
    </main>
  )
}

export const SkeletonProjectCard = () => {
  return (
    <div className='h-full min-h-36 rounded-xl border bg-muted/30 text-card-foreground shadow'>
      <div className='flex w-full flex-row items-center justify-between space-y-1.5 p-6'>
        <div className='w-3/4'>
          <Skeleton className='mb-2 h-5 w-32' />
          <Skeleton className='h-4 w-full' />
        </div>
        <Skeleton className='h-9 w-9 rounded-md' />
      </div>
      <div className='flex justify-end p-6 pb-2 pt-0'>
        <Skeleton className='h-6 w-28 rounded-md' />
      </div>
      <div className='flex items-center justify-between p-6 pt-0'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-4 w-32' />
      </div>
    </div>
  )
}
