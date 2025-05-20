'use client'

import { convertNodesToServices } from '../reactflow/utils/convertNodesToServices'
import ChooseService from '../templates/compose/ChooseService'
import { Button } from '../ui/button'
import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import { Rocket } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Dispatch, SetStateAction, memo, useMemo } from 'react'

import { cn } from '@/lib/utils'
import { Server } from '@/payload-types'
import { useArchitectureContext } from '@/providers/ArchitectureProvider'

const DeploymentDialog = memo(
  ({
    nodes,
    server: { plugins, id: serverId, name: serverName },
    setEdges,
    setNodes,
  }: {
    nodes: Node[]
    server: Server
    setNodes: Dispatch<SetStateAction<Node[]>>
    setEdges: Dispatch<SetStateAction<Edge[]>>
  }) => {
    const params = useParams<{ id: string; organisation: string }>()
    const { deploy, isDeploying } = useArchitectureContext()
    const services = convertNodesToServices(nodes)

    // todo: add disabling deployment logic when plugins not installed
    const disabledDatabasesList = useMemo(() => {
      const databasesList = services?.filter(
        service => service.type === 'database',
      )

      const disabledList = databasesList?.filter(database => {
        const databaseType = database?.databaseDetails?.type

        const pluginDetails = plugins?.find(
          plugin => plugin.name === databaseType,
        )

        return (
          !pluginDetails ||
          (pluginDetails && pluginDetails?.status === 'disabled')
        )
      })

      return disabledList
    }, [services])

    const disabledDatabasesListNames = disabledDatabasesList
      ?.map(database => database?.databaseDetails?.type)
      ?.filter((value, index, self) => {
        return self.indexOf(value) === index
      })

    if (!services?.length) {
      return null
    }

    return (
      <motion.div
        className='absolute left-0 top-2 z-10 grid h-max w-full place-items-center'
        initial={{ opacity: 0, y: '-40px' }}
        animate={{ opacity: 1, y: '0px' }}
        transition={{ duration: 0.2 }}>
        <div
          className={cn(
            'w-full max-w-2xl rounded-md border border-border/50 bg-primary/5 p-2 shadow-lg backdrop-blur-md transition-colors',
            disabledDatabasesList.length
              ? 'border-warning bg-warning-foreground'
              : '',
          )}>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-cq-primary text-sm font-semibold'>
                Deploy {services.length}{' '}
                {services.length === 1 ? 'service' : 'services'}
              </p>

              {disabledDatabasesListNames?.length ? (
                <span className='text-xs text-muted-foreground'>
                  {`Enable ${disabledDatabasesListNames?.join(', ')} plugin for `}
                  <Button
                    variant='link'
                    className='w-min p-0'
                    size={'sm'}
                    asChild>
                    <Link
                      href={`/${params.organisation}/servers/${serverId}?tab=plugins`}>
                      {serverName}
                    </Link>
                  </Button>
                  {` server to deploy services`}
                </span>
              ) : null}

              {isDeploying && (
                <p className='text-sm text-muted-foreground'>
                  This process might take time, please wait...
                </p>
              )}
            </div>

            <div className='flex items-center space-x-2'>
              <Button
                onClick={() => {
                  deploy({
                    projectId: params.id,
                    services,
                  })
                }}
                size='icon'
                disabled={isDeploying || !!disabledDatabasesList.length}
                isLoading={isDeploying}>
                <Rocket size={16} />
              </Button>

              <Button
                variant={'outline'}
                disabled={isDeploying}
                onClick={() => {
                  setNodes([])
                  setEdges([])
                }}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  },
)

DeploymentDialog.displayName = 'DeploymentDialog'

const ServicesArchitecture = ({ server }: { server: Server }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  return (
    <div className='relative mt-4 w-full rounded-md border'>
      <ChooseService
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}>
        <DeploymentDialog
          nodes={nodes}
          setEdges={setEdges}
          setNodes={setNodes}
          server={server}
        />
      </ChooseService>
    </div>
  )
}

export default ServicesArchitecture
