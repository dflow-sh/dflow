'use client'

import { Badge } from "@core/components/ui/badge"
import { Button } from "@core/components/ui/button"
import { format, formatDistanceToNow } from 'date-fns'
import { Rocket, ServerCog } from 'lucide-react'
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

const variant = {
  building: 'info',
  failed: 'destructive',
  success: 'success',
  queued: 'warning',
} as const

const DeploymentList = ({
  deployments,
  serverId,
  serviceId,
}: {
  deployments: (string | Deployment)[]
  serviceId: string
  serverId: string
}) => {
  const filteredDeployments = deployments.filter(
    deployment => typeof deployment !== 'string',
  )

  return (
    <section className='space-y-4'>
      <div className='mb-4 flex items-center gap-1.5'>
        <Rocket />
        <h4 className='text-lg font-semibold'>Deployments</h4>
      </div>
      {filteredDeployments.length ? (
        filteredDeployments?.map(deploymentDetails => {
          const { id, status, createdAt, logs } = deploymentDetails
          const deployedLogs = Array.isArray(logs) ? logs : []

          return (
            <Card key={id} className='text-sm'>
              <CardContent className='flex w-full items-center justify-between pt-4'>
                <div className='flex items-center gap-6'>
                  <Badge
                    className='inline-block rounded-md px-2 py-1 text-[0.75rem] font-semibold uppercase'
                    variant={status ? variant[status] : 'default'}>
                    {status}
                  </Badge>

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
        <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-xs'>
          <div className='grid min-h-[40vh] place-items-center'>
            <div>
              <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                <ServerCog className='text-muted-foreground h-8 w-8 animate-pulse' />
              </div>

              <div className='my-4 space-y-1'>
                <h3 className='text-foreground text-xl font-semibold'>
                  No Deployments Found
                </h3>
                <p className='text-muted-foreground text-base'>
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
