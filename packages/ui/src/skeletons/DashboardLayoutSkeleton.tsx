import { Skeleton } from '../ui/skeleton'

export const DashboardHeaderSkeleton = () => {
  return (
    <div className='sticky top-0 z-50 w-full bg-background'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between p-4'>
        {/* Left side - Logo and brand */}
        <div className='flex min-h-9 items-center gap-2'>
          <div className='flex items-center gap-1'>
            {/* Logo placeholder */}
            <Skeleton className='h-8 w-8 rounded-lg' />
            {/* Brand name - hidden on mobile */}
            <Skeleton className='hidden h-6 w-16 sm:block' />
          </div>
          {/* Project/service/server name placeholders */}
          <div className='flex gap-2'>
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-6 w-20' />
            <Skeleton className='h-6 w-16' />
          </div>
        </div>

        {/* Right side - Navigation items */}
        <div className='flex items-center gap-x-4'>
          {/* Changelog link placeholder */}
          <Skeleton className='h-5 w-20' />

          {/* User avatar menu placeholder */}
          <div className='relative flex shrink-0'>
            <Skeleton className='h-8 w-8 rounded-lg' />
          </div>
        </div>
      </div>
    </div>
  )
}

export const NavUserSkeleton = () => {
  return (
    <div className='relative flex shrink-0'>
      <Skeleton className='h-8 w-8 rounded-lg' />
    </div>
  )
}
