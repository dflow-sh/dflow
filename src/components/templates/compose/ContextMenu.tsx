import type { Edge } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { Trash2 } from 'lucide-react'
import { type FC, useEffect, useRef } from 'react'

import type { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import { useArchitectureContext } from '@/providers/ArchitectureProvider'

interface ContextMenuProps {
  top: number
  left: number
  service: ServiceNode
  edges: Edge[]
  onClick: () => void
}

const ContextMenu: FC<ContextMenuProps> = ({
  top,
  left,
  service,
  onClick,
  edges,
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClick()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClick])

  const deleteNode = (nodeId: string) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId))
    onClick()
  }

  return (
    <div
      ref={menuRef}
      className='back fixed z-10 w-48 rounded-md bg-card/30 shadow-md'
      style={{ top, left }}>
      <ul className='space-y-1 p-2'>
        {/* <li>
          <EditServiceName
            className={
              'w-full justify-between rounded bg-transparent hover:bg-primary/10 hover:text-primary'
            }
            service={service}
            edges={edges}
            onClose={onClick}
          />
        </li>
        <hr /> */}

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
