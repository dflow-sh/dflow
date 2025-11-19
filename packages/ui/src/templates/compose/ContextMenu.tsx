import type { Edge, Node } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { Trash2 } from 'lucide-react'
import { type FC, useRef } from 'react'

import type { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import { useArchitectureContext } from '@/providers/ArchitectureProvider'

import AddVolumeToService from './AddVolumeToService'
import EditServiceName from './EditServiceName'

interface ContextMenuProps {
  top: number
  left: number
  service: ServiceNode
  edges: Edge[]
  nodes: Node[]
  onClick: () => void
}

const ContextMenu: FC<ContextMenuProps> = ({
  top,
  left,
  service,
  onClick,
  edges,
  nodes,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const { setNodes } = useReactFlow()

  const architectureContext = function useSafeArchitectureContext() {
    try {
      return useArchitectureContext()
    } catch (e) {
      return null
    }
  }

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
  //       onClick()
  //     }
  //   }

  //   document.addEventListener('mousedown', handleClickOutside)
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside)
  //   }
  // }, [onClick])

  const deleteNode = (nodeId: string) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId))
    onClick()
  }

  return (
    <div
      ref={menuRef}
      className='back fixed z-10 w-56 rounded-md border border-border bg-card/80 shadow-md backdrop-blur-md'
      style={{ top, left }}>
      <ul className='space-y-1 p-2'>
        <li>
          <EditServiceName
            key={service.id}
            service={service}
            edges={edges}
            nodes={nodes}
            setNodes={setNodes}
            type='contextMenu'
            onCloseContextMenu={onClick}
          />
        </li>

        {service?.type !== 'database' && (
          <li>
            <AddVolumeToService
              onCloseContextMenu={onClick}
              service={service}
              setNodes={setNodes}
              type='contextMenu'
            />
          </li>
        )}
        <hr />
        <Button
          variant='destructive'
          className='w-full'
          disabled={architectureContext()?.isDeploying}
          onClick={() => deleteNode(service.id)}>
          <Trash2 />
          Remove service
        </Button>
      </ul>
    </div>
  )
}

export default ContextMenu
