'use client'

import { ServiceNode } from '../reactflow/types'
import { convertToGraph } from '../reactflow/utils/convertServicesToNodes'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useRouter } from '@bprogress/next'
import {
  Edge,
  MarkerType,
  Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { MoreVertical, Repeat, Trash2 } from 'lucide-react'
import { FC, useCallback, useEffect, useRef, useState } from 'react'

import ReactFlowConfig from '@/components/reactflow/reactflow.config'
import { Server, Service } from '@/payload-types'

import DeleteServiceDialog from './DeleteServiceDialog'
import SwitchServiceProjectDialog from './SwitchServiceProjectDialog'

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
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false)
  const [switchService, setSwitchService] =
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

  // Add handler for switch project
  const handleSwitchProject = useCallback(
    (service: ServiceNode) => {
      const fullService = services.find(s => s.id === service.id)
      if (fullService) {
        setSwitchService(fullService)
        setSwitchDialogOpen(true)
      }
      setMenu(null)
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
        onSwitchProject: () => handleSwitchProject(node),
        onDeleteService: () => handleDeleteService(node),
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

  // Define menuOptions for nodes
  const menuOptions = (node: any) => (
    <div className='absolute right-2 top-2 z-20'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary'
            onClick={e => e.stopPropagation()}
            aria-label='Open menu'>
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation()
              handleSwitchProject(node)
            }}>
            <Repeat className='mr-2' size={16} />
            Switch Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation()
              handleDeleteService(node)
            }}
            className='text-destructive'>
            <Trash2 className='mr-2' size={16} />
            Delete Service
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

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
          className='h-full w-full'
          menuOptions={menuOptions}>
          {menu && (
            <ContextMenu
              onClick={onPaneClick}
              edges={edges}
              onDeleteService={handleDeleteService}
              onSwitchProject={handleSwitchProject}
              {...menu}
            />
          )}
        </ReactFlowConfig>
      </div>

      {/* Delete Service Dialog */}
      {selectedService && (
        <DeleteServiceDialog
          service={selectedService}
          project={project}
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
        />
      )}

      {/* Switch Project Dialog */}
      {switchService && (
        <SwitchServiceProjectDialog
          open={switchDialogOpen}
          setOpen={setSwitchDialogOpen}
          service={switchService}
          project={project}
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
  onSwitchProject: (service: ServiceNode) => void
}

const ContextMenu: FC<ContextMenuProps> = ({
  top,
  left,
  service,
  onClick,
  onDeleteService,
  onSwitchProject,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={menuRef}
      className='fixed z-10 w-48 rounded-md border border-border bg-card/30 shadow-md'
      style={{ top, left }}>
      <ul className='space-y-1 p-2'>
        <Button
          variant='secondary'
          className='w-full'
          onClick={() => onSwitchProject(service)}>
          Switch Project
        </Button>
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
