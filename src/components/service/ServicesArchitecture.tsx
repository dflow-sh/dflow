'use client'

import { convertNodesToServices } from '../reactflow/utils/convertNodesToServices'
import ChooseService from '../templates/compose/ChooseService'
import { Button } from '../ui/button'
import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import { motion } from 'motion/react'

const ServicesArchitecture = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const services = convertNodesToServices(nodes)
  console.log('service', services)
  return (
    <div className='relative w-full'>
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
              <p className='text-cq-primary text-sm font-bold'>
                Deploy {nodes?.length}{' '}
                {nodes?.length === 1 ? 'service' : 'services'}
              </p>
              <div className='inline-flex items-center gap-x-2'>
                <Button size={'sm'}>Deploy</Button>
              </div>
            </div>
          </motion.div>
        )}
      </ChooseService>
    </div>
  )
}

export default ServicesArchitecture
