'use client'

import { ServiceNode } from '../reactflow/types'
import { convertToGraph } from '../reactflow/utils/convertServicesToNodes'
import { Button } from '../ui/button'
import { useRouter } from '@bprogress/next'
import {
  Edge,
  MarkerType,
  Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { Trash2 } from 'lucide-react'
import { FC, useCallback, useEffect, useRef, useState } from 'react'

import ReactFlowConfig from '@/components/reactflow/reactflow.config'
import { Server, Service } from '@/payload-types'

import DeleteServiceDialog from './DeleteServiceDialog'

interface ServiceWithDisplayName extends Service {
  displayName: string
}

const calculateNodePositions = (
  services: ServiceWithDisplayName[],
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

interface Menu {
  service: ServiceNode
  top: number
  left: number
}

const ServiceList = ({
  services,
  project,
  organisationSlug,
}: {
  services: ServiceWithDisplayName[]
  organisationSlug: string
  project: {
    id: string
    name: string
    description?: string | null | undefined
    server: string | Server
  }
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [menu, setMenu] = useState<Menu | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] =
    useState<ServiceWithDisplayName | null>(null)
  const router = useRouter()

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()

      setMenu({
        service: node.data as unknown as ServiceNode,
        top: event.clientY,
        left: event.clientX,
      })
    },
    [],
  )

  const onPaneClick = useCallback(() => setMenu(null), [setMenu])

  const handleDeleteService = useCallback(
    (service: ServiceNode) => {
      // Find the full service object from the services array
      const fullService = services.find(s => s.id === service.id)
      if (fullService) {
        setSelectedService(fullService)
        setDeleteDialogOpen(true)
      }
      setMenu(null) // Close context menu
    },
    [services],
  )

  const handleRedirectToService = (id: string) => {
    router.push(
      `/${organisationSlug}/dashboard/project/${project.id}/service/${id}`,
    )
  }

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
      data: {
        ...node,
        disableNode: Boolean(
          project.server &&
            typeof project.server === 'object' &&
            project.server.connection?.status !== 'success',
        ),
        onClick: () => handleRedirectToService(node.id),
      },
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
    <>
      <div
        className='mx-auto mt-4 h-[calc(100vh-190px)] w-full max-w-6xl rounded-xl border'
        ref={containerRef}>
        <ReactFlowConfig
          edges={edges}
          nodes={nodes}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          className='h-full w-full'>
          {menu && (
            <ContextMenu
              onClick={onPaneClick}
              edges={edges}
              onDeleteService={handleDeleteService}
              {...menu}
            />
          )}
        </ReactFlowConfig>
      </div>

      {selectedService && (
        <DeleteServiceDialog
          service={selectedService}
          project={project}
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
        />
      )}
    </>
  )
}

export default ServiceList

interface ContextMenuProps {
  top: number
  left: number
  service: ServiceNode
  edges: Edge[]
  onClick: () => void
  onDeleteService: (service: ServiceNode) => void
}

const ContextMenu: FC<ContextMenuProps> = ({
  top,
  left,
  service,
  onClick,
  onDeleteService,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={menuRef}
      className='fixed z-10 w-48 rounded-md border border-border bg-card/30 shadow-md'
      style={{ top, left }}>
      <ul className='space-y-1 p-2'>
        <Button
          variant='destructive'
          className='w-full'
          onClick={() => onDeleteService(service)}>
          <Trash2 />
          Delete service
        </Button>
      </ul>
    </div>
  )
}
