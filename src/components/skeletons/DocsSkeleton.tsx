import { Skeleton } from '@/components/ui/skeleton'

export const DocsSidebarSkeleton = () => {
  return (
    <aside className='sticky left-0 h-screen w-64 border-r p-4'>
      <nav>
        <div className='mb-4'>
          <Skeleton className='mb-2 h-6 w-40' /> {/* Section heading */}
          <ul className='ml-2'>
            <li className='py-1'>
              <Skeleton className='h-4 w-32' /> {/* Nav link */}
            </li>
          </ul>
        </div>
        <div className='mb-4'>
          <Skeleton className='mb-2 h-6 w-36' /> {/* Section heading */}
          <ul className='ml-2'>
            <li className='py-1'>
              <Skeleton className='h-4 w-28' /> {/* Nav link */}
            </li>
            <li className='py-1'>
              <Skeleton className='h-4 w-32' /> {/* Nav link */}
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}

export const InternalDocsSkeleton = () => {
  return (
    <main className='mx-auto mb-32 w-full max-w-6xl'>
      <section className='flex h-full w-full'>
        {/* Main Content Skeleton */}
        <div className='h-full flex-1 p-6'>
          <article className='prose prose-purple prose-invert md:prose-lg'>
            <Skeleton className='mb-6 h-8 w-48' /> {/* H1 title */}
            <Skeleton className='mb-2 h-4 w-full' /> {/* Paragraph line */}
            <Skeleton className='mb-6 h-4 w-5/6' /> {/* Paragraph line */}
            <Skeleton className='mb-4 mt-8 h-6 w-40' /> {/* H2 heading */}
            <Skeleton className='mb-2 h-4 w-36' /> {/* Strong text */}
            <Skeleton className='mb-2 h-4 w-full' /> {/* Paragraph line */}
            <Skeleton className='mb-4 mt-8 h-6 w-40' /> {/* H2 heading */}
            <Skeleton className='mb-2 h-4 w-full' /> {/* Paragraph line */}
            <Skeleton className='mb-4 h-4 w-5/6' /> {/* Paragraph line */}
            {/* List skeleton */}
            <div className='my-4 ml-6'>
              <div className='mb-2 flex gap-2'>
                <Skeleton className='h-4 w-2 rounded-full' /> {/* Bullet */}
                <Skeleton className='h-4 w-5/6' /> {/* List item */}
              </div>
              <div className='mb-2 flex gap-2'>
                <Skeleton className='h-4 w-2 rounded-full' /> {/* Bullet */}
                <Skeleton className='h-4 w-4/5' /> {/* List item */}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

export const DocsSkeleton = () => {
  return (
    <main className='mx-auto mb-32 w-full max-w-6xl'>
      <section className='flex h-full w-full'>
        {/* Sidebar Skeleton */}

        {/* Main Content Skeleton */}
        <div className='h-full flex-1 p-6'>
          <article className='prose prose-purple prose-invert md:prose-lg'>
            <Skeleton className='mb-6 h-8 w-48' /> {/* H1 title */}
            <Skeleton className='mb-2 h-4 w-full' /> {/* Paragraph line */}
            <Skeleton className='mb-6 h-4 w-5/6' /> {/* Paragraph line */}
            <Skeleton className='mb-4 mt-8 h-6 w-40' /> {/* H2 heading */}
            <Skeleton className='mb-2 h-4 w-36' /> {/* Strong text */}
            <Skeleton className='mb-2 h-4 w-full' /> {/* Paragraph line */}
            {/* Code block skeleton */}
            <div className='relative my-6 rounded-lg bg-muted/50 p-4'>
              <Skeleton className='mb-1 h-4 w-full' />
              <Skeleton className='mb-1 h-4 w-full' />
              <Skeleton className='mb-1 h-4 w-5/6' />
              <Skeleton className='mb-1 h-4 w-4/5' />
              <Skeleton className='mb-1 h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
            <Skeleton className='mb-4 mt-8 h-6 w-40' /> {/* H2 heading */}
            <Skeleton className='mb-2 h-4 w-full' /> {/* Paragraph line */}
            <Skeleton className='mb-4 h-4 w-5/6' /> {/* Paragraph line */}
            {/* List skeleton */}
            <div className='my-4 ml-6'>
              <div className='mb-2 flex gap-2'>
                <Skeleton className='h-4 w-2 rounded-full' /> {/* Bullet */}
                <Skeleton className='h-4 w-5/6' /> {/* List item */}
              </div>
              <div className='mb-2 flex gap-2'>
                <Skeleton className='h-4 w-2 rounded-full' /> {/* Bullet */}
                <Skeleton className='h-4 w-4/5' /> {/* List item */}
              </div>
            </div>
            {/* Another code block skeleton */}
            <div className='relative my-6 rounded-lg bg-muted/50 p-4'>
              <Skeleton className='mb-1 h-4 w-full' />
              <Skeleton className='mb-1 h-4 w-5/6' />
              <Skeleton className='mb-1 h-4 w-4/5' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
