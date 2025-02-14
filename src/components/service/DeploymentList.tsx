'use client'

import { Button } from '../ui/button'
import { format, formatDistanceToNow } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Deployment } from '@/payload-types'
import { useTerminal } from '@/providers/ServerTerminalProvider'

const DeploymentList = ({ deployments }: { deployments: Deployment[] }) => {
  const statusColors: { [key in Deployment['status']]: string } = {
    success: 'bg-green-300 text-green-900',
    building: 'bg-blue-300 text-blue-900',
    failed: 'bg-red-300 text-red-900',
    queued: 'bg-yellow-300 text-yellow-900',
  }
  const { setOpen } = useTerminal()

  return (
    <div className='space-y-4'>
      {deployments.length ? (
        deployments?.map(({ id, createdAt, status }) => (
          <Card key={id} className='text-sm'>
            <CardContent className='flex w-full items-center justify-between pt-4'>
              <div className='flex items-center gap-6'>
                <p
                  role='status'
                  className={`uppercase ${statusColors[status]} inline-block rounded-md px-2 py-1 text-[0.75rem] font-semibold`}>
                  {status}
                </p>

                <div>
                  <p>{`# ${id}`}</p>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <time>{`Triggered ${formatDistanceToNow(
                          new Date(createdAt),
                          {
                            addSuffix: true,
                          },
                        )}`}</time>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {format(new Date(createdAt), 'LLL d, yyyy h:mm a')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {status === 'building' && (
                <Button
                  variant='outline'
                  onClick={() => {
                    setOpen(true)
                  }}>
                  View Logs
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No deployments Found!</p>
      )}
    </div>
  )
}

export default DeploymentList
