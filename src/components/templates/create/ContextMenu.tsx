import type { Edge } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { type FC, useEffect, useRef } from 'react'

import type { ServiceNode } from '@/components/reactflow/types'

import EditServiceName from './EditServiceName'

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
      className='fixed z-20 w-56 rounded-md border bg-card shadow-md'
      style={{ top, left }}>
      <ul className='space-y-2 p-2'>
        <li>
          <EditServiceName
            className={
              'w-full justify-between rounded bg-transparent hover:bg-primary/10 hover:text-primary'
            }
            service={service}
            edges={edges}
            onClose={onClick}
          />
        </li>
        <hr />
        <li
          className='w-full cursor-pointer rounded px-2 py-1 text-destructive hover:bg-primary/10 hover:text-primary'
          onClick={() => deleteNode(service.id)}>
          Remove Service
        </li>
      </ul>
    </div>
  )
}

export default ContextMenu
