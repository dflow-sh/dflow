'use client'

import ReactFlowConfig from '../reactflow/reactflow.config'
import { Skeleton } from '../ui/skeleton'
import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'

const ServicesSkeleton = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  return (
    <main className='mx-auto mb-32 w-full max-w-6xl'>
      <section>
        <div className='flex w-full justify-between'>
          <div>
            <Skeleton className='mb-2 h-8 w-48' />
            <Skeleton className='h-4 w-32' />
          </div>
          <Skeleton className='h-9 w-36' />
        </div>

        <div className='mx-auto mt-4 h-[calc(100vh-190px)] w-full max-w-6xl rounded-xl border'>
          <ReactFlowConfig
            edges={edges}
            nodes={nodes}
            onEdgesChange={onEdgesChange}
            onNodesChange={onNodesChange}
            className='h-full w-full'>
            <div className='flex h-full w-full flex-col items-center justify-center gap-4 px-2 md:flex-row'>
              {/* Generate 6 skeleton card placeholders */}
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className='h-36 w-full rounded-xl border bg-[#171d33] text-card-foreground shadow md:w-72'>
                    <div className='flex w-full flex-row justify-between space-y-1.5 p-6'>
                      <div className='flex items-center gap-x-3'>
                        <Skeleton className='size-6 rounded-full' />
                        <div className='flex-1 items-start'>
                          <Skeleton className='mb-2 h-5 w-32' />
                          <Skeleton className='h-4 w-24' />
                        </div>
                      </div>
                      <Skeleton className='h-9 w-9 flex-shrink-0 rounded-md' />
                    </div>
                    <div className='flex items-center p-6 pt-0'>
                      <Skeleton className='h-4 w-36' />
                    </div>
                  </div>
                ))}
            </div>
          </ReactFlowConfig>
        </div>
      </section>
    </main>
  )
}

export default ServicesSkeleton
