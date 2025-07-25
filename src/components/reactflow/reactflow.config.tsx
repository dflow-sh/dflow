'use client'

import {
  Background,
  Controls,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
  ReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import FloatingEdge from '@/components/reactflow/FloatingEdges'
import FloatingConnectionLine from '@/components/reactflow/FloatingEdges/FloatingConnectionLine'
import { cn } from '@/lib/utils'

import CustomNode from './CustomNodes'

//background types
enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
  Cross = 'cross',
}

const ReactFlowConfig = ({
  children,
  nodes,
  onNodesChange,
  edges,
  onEdgesChange,
  className,
  onPaneClick,
  onNodeContextMenu,
  menuOptions,
}: {
  children?: React.ReactNode
  nodes: Node[]
  onNodesChange: OnNodesChange
  edges: Edge[]
  onEdgesChange: OnEdgesChange
  className?: string
  onPaneClick?: () => void
  onNodeContextMenu?: (event: React.MouseEvent, node: Node) => void
  menuOptions?: (node: Node) => React.ReactNode
}) => {
  //custom nodes
  const nodeTypes = {
    custom: (props: any) => <CustomNode {...props} menuOptions={menuOptions} />,
  }

  //floating edges
  const edgeTypes = {
    floating: FloatingEdge,
  }

  return (
    <div className={cn('relative h-[calc(100vh-156px)] w-full', className)}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        maxZoom={1}
        fitView
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        className='z-10'>
        <Background
          variant={BackgroundVariant.Cross}
          lineWidth={0.2}
          gap={32}
          className='bg-base-100 text-base-content/80'
        />
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
