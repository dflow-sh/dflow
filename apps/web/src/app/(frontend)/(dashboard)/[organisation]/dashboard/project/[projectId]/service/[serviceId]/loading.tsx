import { Skeleton } from '@dflow/core/components/ui/skeleton'

const Loading = () => {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-7 w-24' />
      <Skeleton className='h-96 w-full' />
    </div>
  )
}

export default Loading
