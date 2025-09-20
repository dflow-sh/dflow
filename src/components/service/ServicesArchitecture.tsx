'use client'

import { convertNodesToServices } from '../reactflow/utils/convertNodesToServices'
import ChooseService, { ChildRef } from '../templates/compose/ChooseService'
import { Button } from '../ui/button'
import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import { Rocket } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Dispatch,
  SetStateAction,
  memo,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts'

import { cn } from '@/lib/utils'
import { Server } from '@/payload-types'
import { useArchitectureContext } from '@/providers/ArchitectureProvider'

type FlowStorage = {
  nodes: Node[]
  edges: Edge[]
}

const DeploymentDialog = memo(
  ({
    projectId,
    nodes,
    server: { plugins, id: serverId, name: serverName },
    setEdges,
    setNodes,
  }: {
    nodes: Node[]
    server: Server
    setNodes: Dispatch<SetStateAction<Node[]>>
    setEdges: Dispatch<SetStateAction<Edge[]>>
    projectId: string
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
        className='absolute top-2 left-0 z-10 grid h-max w-full place-items-center'
        initial={{ opacity: 0, y: '-40px' }}
        animate={{ opacity: 1, y: '0px' }}
        transition={{ duration: 0.2 }}>
        <div
          className={cn(
            'border-border/50 bg-primary/5 w-full max-w-2xl rounded-md border p-2 shadow-lg backdrop-blur-md transition-colors',
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
                <span className='text-muted-foreground text-xs'>
                  {`${disabledDatabasesListNames?.join(', ')} plugin `}
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
                  {` will be installed during deployment!`}
                </span>
              ) : null}
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
                disabled={isDeploying}
                isLoading={isDeploying}>
                <Rocket size={16} />
              </Button>

              <Button
                variant={'outline'}
                disabled={isDeploying}
                onClick={() => {
                  setNodes([])
                  setEdges([])
                  if (projectId && typeof window !== 'undefined') {
                    localStorage.removeItem(projectId)
                  }
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

const ServicesArchitecture = ({
  server,
  projectId,
}: {
  server: Server
  projectId: string
}) => {
  const childRef = useRef<ChildRef>(null)
  const storedFlow = useReadLocalStorage<FlowStorage>(projectId)
  const { nodes: storedNodes, edges: storedEdges } = storedFlow ?? {
    nodes: [],
    edges: [],
  }

  const initialNodes =
    storedNodes && storedNodes?.length > 0
      ? storedNodes?.map(node => ({
          ...node,
          data: {
            ...node.data,
            onClick: () => callChildFunction({ serviceId: node.id! }),
          },
          type: 'custom',
        }))
      : []
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    ...initialNodes,
  ])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([...storedEdges])

  const [flow, setFlow, removeFlow] = useLocalStorage<FlowStorage>(projectId, {
    nodes: storedNodes,
    edges: storedEdges,
  })

  const callChildFunction = (args: { serviceId: string }) => {
    childRef.current?.handleOnClick(args)
  }

  useEffect(() => {
    setFlow({ nodes, edges })
  }, [nodes, edges])

  return (
    <div className='relative mt-4 w-full'>
      <ChooseService
        ref={childRef}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}>
        <DeploymentDialog
          projectId={projectId}
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
