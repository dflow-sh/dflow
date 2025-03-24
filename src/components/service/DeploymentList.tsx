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

import DeploymentTerminal from './DeploymentTerminal'

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
    success: 'bg-green-300 text-green-900',
    building: 'bg-blue-300 text-blue-900',
    failed: 'bg-red-300 text-red-900',
    queued: 'bg-yellow-300 text-yellow-900',
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
        <p>No deployments Found!</p>
      )}
    </section>
  )
}

export default DeploymentList
