import { Avatar } from '../ui/avatar'
import { Skeleton } from '../ui/skeleton'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@dflow/components/ui/table'

const TeamSkeleton = () => {
  return (
    <div className='mt-4 space-y-10'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-32' />
        <div className='flex w-full items-start gap-x-2'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
        </div>
      </div>
      <div>
        <Skeleton className='mb-1 h-8 w-32' />
        <Skeleton className='mb-2 h-4 w-96' />
        <div className='border-border overflow-hidden rounded-lg border'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className='h-6 w-32' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-6 w-32' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-6 w-32' />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className='font-medium'>
                  <div className='flex w-full items-center gap-x-2'>
                    <Avatar className='size-10 rounded-full'>
                      <Skeleton className='size-10 rounded-full' />
                    </Avatar>
                    <div className='space-y-2'>
                      <Skeleton className='h-6 w-22' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Skeleton className='h-6 w-32' />
                </TableCell>

                <TableCell>
                  <Skeleton className='h-6 w-32' />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-x-2'>
                    <Avatar className='size-10 rounded-full'>
                      <Skeleton className='size-10 rounded-full' />
                    </Avatar>
                    <div className='space-y-2'>
                      <Skeleton className='h-6 w-22' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Skeleton className='h-6 w-32' />
                </TableCell>

                <TableCell>
                  <Skeleton className='h-6 w-32' />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-x-2'>
                    <Avatar className='size-10 rounded-full'>
                      <Skeleton className='size-10 rounded-full' />
                    </Avatar>
                    <div className='space-y-2'>
                      <Skeleton className='h-6 w-22' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Skeleton className='h-6 w-32' />
                </TableCell>

                <TableCell>
                  <Skeleton className='h-6 w-32' />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default TeamSkeleton
