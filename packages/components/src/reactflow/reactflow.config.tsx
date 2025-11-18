'use client'

import {
  Background,
  Controls,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect } from 'react'

import FloatingEdge from '@dflow/components/reactflow/FloatingEdges'
import FloatingConnectionLine from '@dflow/components/reactflow/FloatingEdges/FloatingConnectionLine'
import { cn } from '@dflow/lib/utils'

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

  const { setCenter, getNode, getViewport, fitView } = useReactFlow()

  useEffect(() => {
    const handleResize = () => {
      fitView({
        duration: 400,
        includeHiddenNodes: false,
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [fitView])

  const onNodeClick = useCallback(
    (event: any, clickedNode: any) => {
      // Get the full node data including dimensions
      const node = getNode(clickedNode.id)

      if (node) {
        sessionStorage.setItem('nodeId', node.id)
        // Calculate the center of the node
        const nodeX = node.position.x + (node.width || 0) / 2
        const nodeY = node.position.y + (node.height || 0) / 2

        // Get viewport dimensions
        const viewportElement = event.target.closest('.react-flow')
        if (viewportElement) {
          const viewportWidth = viewportElement.clientWidth
          const viewportHeight = viewportElement.clientHeight

          const targetScreenX = viewportWidth * 0.2
          const targetScreenY = viewportHeight * 0.4
          const { x: vpX, y: vpY, zoom } = getViewport()
          const offsetX = (viewportWidth / 2 - targetScreenX) / zoom
          const offsetY = (viewportHeight / 2 - targetScreenY) / zoom

          setCenter(nodeX + offsetX, nodeY + offsetY, {
            // zoom: zoom,
            duration: 800,
          })
        }
      }
    },
    [setCenter, getNode, getViewport],
  )
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
        onNodeClick={onNodeClick}
        className='z-10'>
        <Background
          variant={BackgroundVariant.Cross}
          lineWidth={0.2}
          gap={32}
          bgColor='var(--background)'
          color='var(--foreground)'
        />
        <Controls position='center-left' className='bg-primary-foreground' />
        {children}
      </ReactFlow>
    </div>
  )
}

export default ReactFlowConfig
