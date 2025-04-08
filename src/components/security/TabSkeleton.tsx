import { Loader2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const TabSkeleton = ({ title }: { title: string }) => (
  <Card className='w-full'>
    <CardHeader>
      <div className='flex items-center justify-between'>
        <CardTitle className='text-2xl'>{title}</CardTitle>
        <div className='h-9 w-24 animate-pulse rounded-md bg-muted'></div>
      </div>
      <CardDescription className='h-4 w-2/3 animate-pulse rounded bg-muted'></CardDescription>
    </CardHeader>
    <CardContent>
      <div className='flex items-center justify-center py-10'>
        <Loader2 className='h-10 w-10 animate-spin text-muted-foreground' />
      </div>
    </CardContent>
  </Card>
)

export default TabSkeleton
