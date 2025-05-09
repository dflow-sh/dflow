'use client'

import { convertNodesToServices } from '../reactflow/utils/convertNodesToServices'
import ChooseService from '../templates/compose/ChooseService'
import { Button } from '../ui/button'
import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import { Rocket } from 'lucide-react'
import { motion } from 'motion/react'
import { useParams } from 'next/navigation'

import { useArchitectureContext } from '@/providers/ArchitectureProvider'

const ServicesArchitecture = () => {
  const params = useParams<{ id: string }>()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const services = convertNodesToServices(nodes)

  const { deploy, isDeploying } = useArchitectureContext()

  return (
    <div className='relative mt-4 w-full rounded-md border'>
      <ChooseService
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}>
        {nodes?.length! > 0 && (
          <motion.div
            initial={{ opacity: 0, y: '-40px' }}
            animate={{ opacity: 1, y: '0px' }}
            transition={{ duration: 0.2 }}
            className='absolute left-0 top-2 z-10 w-full max-w-[26rem] -translate-x-1/2 transform rounded-md border border-border/50 bg-primary/5 p-2 shadow-lg backdrop-blur-md md:left-1/3'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-cq-primary text-sm font-semibold'>
                  Deploy {nodes?.length}{' '}
                  {nodes?.length === 1 ? 'service' : 'services'}
                </p>

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
                  }}>
                  Discard
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </ChooseService>
    </div>
  )
}

export default ServicesArchitecture
