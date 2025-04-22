'use client'

import {
  Edge,
  MarkerType,
  Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { useEffect, useRef } from 'react'

import ReactFlowConfig from '@/components/reactflow/reactflow.config'
import { Service } from '@/payload-types'

function convertToGraph(data: Service[]) {
  const nodes = data.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    createdAt: item.createdAt,
    databaseDetails: item.databaseDetails,
    environmentVariables: item.environmentVariables ?? {},
  }))

  const allServiceNames = new Set(data.map(item => item.name))
  const edgeSet = new Set<string>()
  const edges: Edge[] = []

  data.forEach(service => {
    const sourceName = service.name
    const envVars = service.environmentVariables ?? {}

    Object.values(envVars).forEach(env => {
      if (
        typeof env === 'object' &&
        'linkedService' in env &&
        typeof env.linkedService === 'string'
      ) {
        const targetName = env.linkedService
        if (allServiceNames.has(targetName) && targetName !== sourceName) {
          const [from, to] = [sourceName, targetName].sort()
          const edgeId = `${from}-${to}`
          if (!edgeSet.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: from,
              target: to,
            })
            edgeSet.add(edgeId)
          }
        }
      }
    })
  })

  return { nodes, edges }
}

const calculateNodePositions = (
  services: Service[],
  containerWidth: number,
  containerHeight: number,
) => {
  const nodeWidth = 150
  const nodeHeight = 100
  const marginX = 150
  const marginY = 100

  const rowCapacity = Math.ceil(Math.sqrt(services.length))
  const totalRows = Math.ceil(services.length / rowCapacity)

  const totalGridWidth = rowCapacity * nodeWidth + (rowCapacity - 1) * marginX
  const totalGridHeight = totalRows * nodeHeight + (totalRows - 1) * marginY

  const startX = (containerWidth - totalGridWidth) / 2
  const startY = 100 // <-- push slightly toward the top

  const positions = services.map((_, index) => {
    const row = Math.floor(index / rowCapacity)
    const col = index % rowCapacity
    const x = startX + col * (nodeWidth + marginX)
    const y = startY + row * (nodeHeight + marginY)
    return { x, y }
  })

  return positions
}

const ServicesArchitecture = ({ services }: { services: Service[] }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const initialPositions = calculateNodePositions(services, width, height)
    const { edges: edgesData, nodes: nodesData } = convertToGraph(services)

    const initialNodes = nodesData?.map((node, index) => ({
      id: node.id,
      position: initialPositions[index],
      data: { ...node },
      type: 'custom',
    }))

    const initialEdges = edgesData?.map(edge => ({
      type: 'floating',
      style: { strokeDasharray: '5 5' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      ...edge,
    }))

    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [services])

  return (
    <div className='mb-12 mt-10'>
      <h2 className='mb-4 text-2xl font-semibold'>Architecture</h2>
      <div className='h-[600px] w-full rounded-xl border' ref={containerRef}>
        <ReactFlowConfig
          edges={edges}
          nodes={nodes}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          className='h-full w-full'
        />
      </div>
    </div>
  )
}

export default ServicesArchitecture
