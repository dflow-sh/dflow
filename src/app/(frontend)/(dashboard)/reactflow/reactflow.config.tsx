'use client'

import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import FloatingEdge from '@/app/(frontend)/(dashboard)/reactflow/FloatingEdges'
import FloatingConnectionLine from '@/app/(frontend)/(dashboard)/reactflow/FloatingEdges/FloatingConnectionLine'
import { cn } from '@/lib/utils'

const calculateNodePositions = (
  services: any,
  containerWidth: number,
  containerHeight: number,
) => {
  const nodeWidth = 150 // Node width
  const nodeHeight = 100 // Node height
  const marginX = 150 // Horizontal margin between nodes
  const marginY = 100 // Vertical margin between nodes

  // Max nodes per row
  const rowCapacity = Math.ceil(Math.sqrt(services.length))
  // Total rows needed
  const totalRows = Math.ceil(services.length / rowCapacity)

  // Total grid dimensions
  const totalGridWidth = rowCapacity * nodeWidth + (rowCapacity - 1) * marginX
  const totalGridHeight = totalRows * nodeHeight + (totalRows - 1) * marginY

  // Center grid inside the container
  const startX = (containerWidth - totalGridWidth) / 2
  const startY = (containerHeight - totalGridHeight) / 2

  const positions = services?.map((node: any, index: number) => {
    const row = Math.floor(index / rowCapacity)
    const col = index % rowCapacity

    const x = startX + col * (nodeWidth + marginX)
    const y = startY + row * (nodeHeight + marginY)

    return { x, y }
  })

  return positions
}

const ReactFlowConfig = ({
  children,
  nodes,
  onNodesChange,
  edges,
  onEdgesChange,
}: {
  children: React.ReactNode
  nodes: any[]
  onNodesChange: (nodes: any) => void
  edges: any[]
  onEdgesChange: (edges: any) => void
}) => {
  const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 800
  const containerHeight =
    typeof window !== 'undefined' ? window.innerHeight : 600

  //   const initialPositions = calculateNodePositions(
  //     nodes,
  //     containerWidth,
  //     containerHeight,
  //   )

  const TestComponent = ({ data }: any) => {
    return (
      <div
        className={cn(
          'border-base-content/20 relative flex h-32 w-full flex-col items-start justify-between overflow-hidden rounded-md border bg-card p-4 shadow-lg drop-shadow-md md:w-64',
        )}>
        <Handle
          type='source'
          style={{
            opacity: 0,
            width: 10,
            height: 10,
            pointerEvents: 'none',
          }}
          position={Position.Left}
        />

        <Handle
          type='target'
          style={{
            opacity: 0,
            width: 10,
            height: 10,
            pointerEvents: 'none',
          }}
          position={Position.Right}
        />
      </div>
    )
  }
  const nodeTypes = {
    custom: TestComponent,
  }
  const edgeTypes = {
    floating: FloatingEdge,
  }

  console.log('node change', onNodesChange)
  return (
    <div className='h-[calc(100%-80px)] w-[calc(100%-40px)]'>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        maxZoom={1}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        className='z-10'>
        <Background gap={24} className='bg-base-100 text-base-content/80' />
        <Controls
          position='center-left'
          className='bg-primary-foreground text-muted'
        />
        {children}
      </ReactFlow>
    </div>
  )
}

export default ReactFlowConfig
