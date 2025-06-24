'use client'

import { Button } from '../ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { ServerCog } from 'lucide-react'
import dynamic from 'next/dynamic'

import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Deployment } from '@/payload-types'

const DeploymentTerminal = dynamic(() => import('./DeploymentTerminal'), {
  ssr: false,
})

const DeploymentList = ({
  deployments,
  serverId,
  serviceId,
}: {
  deployments: (string | Deployment)[]
  serviceId: string
  serverId: string
}) => {
  const statusColors: { [key in Deployment['status']]: string } = {
    success: 'bg-success-foreground text-success border-success/30',
    building: 'bg-info-foreground text-info border-info/30',
    failed: 'bg-destructive/30 text-red-500 border-red-500/30',
    queued: 'bg-warning-foreground text-warning/70 border-warning/70',
  }

  const filteredDeployments = deployments.filter(
    deployment => typeof deployment !== 'string',
  )

  return (
    <section className='space-y-4'>
      {filteredDeployments.length ? (
        filteredDeployments?.map(deploymentDetails => {
          const { id, status, createdAt, logs } = deploymentDetails
          const deployedLogs = Array.isArray(logs) ? logs : []

          return (
            <Card key={id} className='text-sm'>
              <CardContent className='flex w-full items-center justify-between pt-4'>
                <div className='flex items-center gap-6'>
                  <p
                    role='status'
                    className={`border uppercase ${statusColors[status]} inline-block rounded-md px-2 py-1 text-[0.75rem] font-semibold`}>
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

                <DeploymentTerminal
                  logs={deployedLogs}
                  deployment={deploymentDetails}
                  serverId={serverId}
                  serviceId={serviceId}>
                  <Button variant='outline'>View Logs</Button>
                </DeploymentTerminal>
              </CardContent>
            </Card>
          )
        })
      ) : (
        <div className='rounded-2xl border bg-muted/10 p-8 text-center shadow-sm'>
          <div className='grid min-h-[40vh] place-items-center'>
            <div>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                <ServerCog className='h-8 w-8 animate-pulse text-muted-foreground' />
              </div>

              <div className='my-4 space-y-1'>
                <h3 className='text-xl font-semibold text-foreground'>
                  No Deployments Found
                </h3>
                <p className='text-base text-muted-foreground'>
                  You haven’t added any deployments yet.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default DeploymentList
