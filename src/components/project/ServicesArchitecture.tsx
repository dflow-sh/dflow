'use client'

import { convertToGraph } from '../reactflow/utils/convertServicesToGraph'
import { useRouter } from '@bprogress/next'
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

const ServicesArchitecture = ({
  services,
  projectId,
}: {
  services: Service[]
  projectId: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const router = useRouter()
  const handleRedirectToService = (id: string) => {
    router.push(`/dashboard/project/${projectId}/service/${id}`)
  }
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const initialPositions = calculateNodePositions(services, width, height)
    const { edges: edgesData, nodes: nodesData } = convertToGraph(services)
    console.log({ edgesData, nodesData })
    const initialNodes = nodesData?.map((node, index) => ({
      id: node.id,
      position: initialPositions[index],
      data: { ...node, onClick: () => handleRedirectToService(node.id) },
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
    <div
      className='mt-4 h-[calc(100vh-156px)] w-full rounded-xl border'
      ref={containerRef}>
      <ReactFlowConfig
        edges={edges}
        nodes={nodes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        className='h-full w-full'
      />
    </div>
  )
}

export default ServicesArchitecture
