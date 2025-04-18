import { Skeleton } from '@/components/ui/skeleton'

export const ServerSkeleton = () => {
  return (
    <div className='flex h-full w-full justify-center overflow-x-hidden'>
      <div className='flex w-full max-w-6xl flex-col gap-4 p-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-2 text-2xl font-semibold'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
          </div>
        </div>

        <div className='mt-2'>
          <Skeleton className='h-10 w-40' />
        </div>

        <div className='mt-4 flex w-full gap-x-4'>
          <Skeleton className='h-96 w-2/3' />
          <Skeleton className='h-96 w-1/3' />
        </div>
      </div>
    </div>
  )
}

export const GeneralTabSkeleton = () => {
  return (
    <div className='flex flex-col space-y-5'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-[200px]' />
          <div className='flex items-center space-x-2'>
            <Skeleton className='h-8 w-[150px]' />
            <Skeleton className='h-8 w-[150px]' />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='rounded-xl border bg-muted/30 p-6'>
              <div className='flex items-center justify-between pb-2'>
                <Skeleton className='h-5 w-[120px]' />
                <Skeleton className='h-4 w-4 rounded-full' />
              </div>
              <Skeleton className='h-5 w-[100px]' />
            </div>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <div className='space-y-4 rounded bg-muted/30 p-4'>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-[60px]' />
              <Skeleton className='h-9 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-[90px]' />
              <Skeleton className='h-20 w-full' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Skeleton className='h-5 w-[70px]' />
                <Skeleton className='h-9 w-full' />
              </div>
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-[90px]' />
              <Skeleton className='h-9 w-full' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Skeleton className='h-5 w-[50px]' />
                <Skeleton className='h-9 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-5 w-[80px]' />
                <Skeleton className='h-9 w-full' />
              </div>
            </div>
            <div className='flex justify-end'>
              <Skeleton className='h-9 w-[80px]' />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4'>
          <div className='h-full w-full rounded-sm border bg-muted/30'>
            <div className='flex flex-col space-y-1.5 border-b p-6'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-6 w-6 rounded-full' />
                <div className='flex flex-col'>
                  <Skeleton className='h-5 w-[150px]' />
                  <Skeleton className='mt-1 h-4 w-[100px]' />
                </div>
              </div>
            </div>
            <div className='p-0'>
              <div className='relative border-b'>
                <div className='flex items-center justify-between p-4 pb-2 pr-6'>
                  <div className='flex w-full items-center space-x-3'>
                    <div className='flex items-center space-x-2'>
                      <Skeleton className='h-4 w-4' />
                      <Skeleton className='h-5 w-5' />
                    </div>
                    <div className='flex-grow'>
                      <Skeleton className='h-5 w-[100px]' />
                      <Skeleton className='mt-1 h-4 w-[80px]' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const PluginsTabSkeleton = () => {
  return (
    <main className='mx-auto mb-10 mt-4 w-full max-w-6xl px-4'>
      <div className='space-y-4 rounded bg-muted/30 p-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-9 w-32' />
        </div>

        {/* Sync Plugins alert skeleton */}
        <div className='relative w-full rounded-lg border p-4'>
          <div className='flex items-start gap-3'>
            <Skeleton className='h-4 w-4' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-5 w-48' />
              <div className='flex flex-col justify-between gap-2 md:flex-row'>
                <Skeleton className='h-4 w-64' />
                <Skeleton className='h-9 w-32' />
              </div>
            </div>
          </div>
        </div>

        {/* Database section */}
        <div className='space-y-2 pt-2'>
          <Skeleton className='h-6 w-24' />
          <div className='grid gap-4 md:grid-cols-3'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='rounded-xl border bg-muted/30 p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5' />
                    <Skeleton className='h-6 w-32' />
                  </div>
                </div>
                <div className='mt-4 flex items-center justify-between'>
                  <Skeleton className='h-9 w-24' />
                  <Skeleton className='h-5 w-9 rounded-full' />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain section */}
        <div className='space-y-2 pt-2'>
          <Skeleton className='h-6 w-24' />
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-xl border bg-muted/30 p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-5' />
                  <Skeleton className='h-6 w-32' />
                </div>
              </div>
              <div className='mt-4 flex items-center justify-between'>
                <div className='flex gap-2'>
                  <Skeleton className='h-9 w-24' />
                  <Skeleton className='h-9 w-9' />
                </div>
                <Skeleton className='h-5 w-9 rounded-full' />
              </div>
            </div>
          </div>
        </div>

        {/* Message Queue section */}
        <div className='space-y-2 pt-2'>
          <Skeleton className='h-6 w-24' />
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-xl border bg-muted/30 p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-5' />
                  <Skeleton className='h-6 w-32' />
                </div>
              </div>
              <div className='mt-4 flex items-center justify-between'>
                <Skeleton className='h-9 w-24' />
                <Skeleton className='h-5 w-9 rounded-full' />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Plugins section */}
        <div className='space-y-2 pt-2'>
          <Skeleton className='h-6 w-32' />
          <div className='grid gap-4 md:grid-cols-3'>
            {[...Array(20)].map((_, i) => (
              <div key={i} className='rounded-xl border bg-muted/30 p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5' />
                    <Skeleton className='h-6 w-32' />
                  </div>
                </div>
                <div className='mt-4 flex items-center justify-between'>
                  <Skeleton className='h-9 w-24' />
                  <Skeleton className='h-5 w-9 rounded-full' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export const MonitoringTabSkeleton = () => {
  return (
    <main className='mx-auto mb-10 mt-4 w-full max-w-6xl px-4'>
      <div>
        {/* Header Skeleton */}
        <div className='mb-6 flex items-start justify-between'>
          <div className='w-full max-w-md'>
            <Skeleton className='mb-2 h-6 w-3/4' />
            <Skeleton className='h-4 w-5/6' />
          </div>
          <div className='hidden items-center space-x-2 md:flex'>
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-9 w-24' />
          </div>
          <div className='md:hidden'>
            <Skeleton className='h-9 w-9' />
          </div>
        </div>

        {/* Last Updated Skeleton */}
        <div className='mb-4'>
          <Skeleton className='h-4 w-48' />
        </div>

        {/* Stats Grid Skeleton */}
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='rounded-xl border bg-muted/30 p-6'>
              <div className='mb-4'>
                <Skeleton className='h-4 w-3/4' />
              </div>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-6 w-16' />
                <Skeleton className='h-4 w-4 rounded-full' />
              </div>
            </div>
          ))}
        </div>

        <div className='space-y-6'>
          {/* Three Column Stats Grid */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* CPU Usage Skeleton */}
            <div className='rounded-xl border bg-muted/30 p-6 shadow-sm'>
              <div className='flex flex-col space-y-1.5 pb-2'>
                <Skeleton className='h-4 w-1/2' />
              </div>
              <div className='space-y-2 pt-0'>
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-7 w-12' />
                  <Skeleton className='h-4 w-4 rounded-full' />
                </div>
                <Skeleton className='h-2 w-full rounded-full' />
              </div>
            </div>

            {/* Memory Usage Skeleton */}
            <div className='rounded-xl border bg-muted/30 p-6 shadow-sm'>
              <div className='flex flex-col space-y-1.5 pb-2'>
                <Skeleton className='h-4 w-1/2' />
              </div>
              <div className='space-y-2 pt-0'>
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-7 w-16' />
                  <Skeleton className='h-4 w-4 rounded-full' />
                </div>
                <Skeleton className='h-2 w-full rounded-full' />
              </div>
            </div>

            {/* Network Traffic Skeleton */}
            <div className='rounded-xl border bg-muted/30 p-6 shadow-sm'>
              <div className='flex flex-col space-y-1.5 pb-2'>
                <Skeleton className='h-4 w-1/2' />
              </div>
              <div className='mt-2 space-y-2 pt-0'>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col space-y-1 sm:flex-row sm:space-x-3 sm:space-y-0'>
                    <div>
                      <Skeleton className='h-4 w-20' />
                    </div>
                    <div>
                      <Skeleton className='h-4 w-20' />
                    </div>
                  </div>
                  <Skeleton className='h-4 w-4 rounded-full' />
                </div>
              </div>
            </div>
          </div>

          {/* System Health Summary Skeleton */}
          <div className='rounded-xl border bg-muted/30 p-6 shadow-sm'>
            <div className='flex flex-col space-y-1.5 pb-2'>
              <Skeleton className='h-4 w-1/3' />
            </div>
            <div className='pt-0'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-5 w-5 rounded-full' />
                <Skeleton className='h-5 w-40' />
              </div>
              <div className='mt-2'>
                <Skeleton className='h-4 w-full' />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className='mb-4 mt-12'>
          <div className='inline-flex h-9 w-full max-w-max items-center justify-center rounded-lg bg-muted p-1'>
            {['Overview', 'CPU', 'Memory', 'Disk', 'Network'].map(tab => (
              <Skeleton key={tab} className='mx-1 h-7 w-20' />
            ))}
          </div>
        </div>

        {/* Chart Area Skeleton */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='rounded-xl border bg-muted/30 p-6'>
            <div className='mb-4'>
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='mt-1 h-3 w-1/2' />
            </div>
            <Skeleton className='h-64 w-full' />
          </div>
          <div className='rounded-xl border bg-muted/30 p-6'>
            <div className='mb-4'>
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='mt-1 h-3 w-1/2' />
            </div>
            <Skeleton className='h-64 w-full' />
          </div>
          <div className='rounded-xl border bg-muted/30 p-6'>
            <div className='mb-4'>
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='mt-1 h-3 w-1/2' />
            </div>
            <Skeleton className='h-64 w-full' />
          </div>
          <div className='rounded-xl border bg-muted/30 p-6'>
            <div className='mb-4'>
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='mt-1 h-3 w-1/2' />
            </div>
            <Skeleton className='h-64 w-full' />
          </div>
        </div>
      </div>
    </main>
  )
}
