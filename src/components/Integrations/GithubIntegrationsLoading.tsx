import { Skeleton } from '../ui/skeleton'

const GithubIntegrationsLoading = () => {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className='h-24 w-full' />
      ))}
    </div>
  )
}

export default GithubIntegrationsLoading
