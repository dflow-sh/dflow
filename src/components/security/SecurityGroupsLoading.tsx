import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const SecurityGroupsLoading = () => {
  return (
    <div className='space-y-4'>
      {[1, 2, 3].map(item => (
        <Card key={item}>
          <CardContent className='flex h-24 w-full items-center justify-between gap-3 pt-4'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-5 w-5 rounded-full' />
              <div>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='mt-2 h-4 w-60' />
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-9 w-9' />
              <Skeleton className='h-9 w-9' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SecurityGroupsLoading
