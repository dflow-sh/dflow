import { Edge, Node, useReactFlow } from '@xyflow/react'
import { SquarePen } from 'lucide-react'
import { useCallback, useState } from 'react'

import { ServiceNode } from '@/components/reactflow/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { slugify } from '@/lib/slugify'
import { cn } from '@/lib/utils'

const EditServiceName = ({
  service,
  edges,
  onClose,
  className,
}: {
  service: ServiceNode
  edges: Edge[]
  onClose?: () => void
  className?: string
}) => {
  const [ediServiceName, setEditServiceName] = useState<boolean>(false)
  const [serviceName, setServiceName] = useState<string>(service?.name ?? '')
  const { setNodes } = useReactFlow()
  const handleEditClick = useCallback(() => {
    setEditServiceName(true)
  }, [])
  const updateServiceName = (newServiceName: string) => {
    const oldServiceName = service.name

    const connectedEdges = edges.filter(edge => edge.target === service.id)

    const connectedNodeNames = connectedEdges.map(edge => edge.source)

    setNodes((prevNodes: Node[]) =>
      prevNodes.map(node => {
        if (node.id === service.id) {
          return {
            ...node,
            data: {
              ...node.data,
              name: newServiceName,
            },
          }
        }

        if (connectedNodeNames.includes(node.id)) {
          const updatedVariables = Array.isArray(node.data?.variables)
            ? node.data.variables.map(
                (variable: NonNullable<ServiceNode['variables']>[number]) => {
                  const updatedValue = variable?.value.replace(
                    new RegExp(`\\$\\{\\{[^:{}\\s]+:${oldServiceName}\\.`),
                    match =>
                      match.replace(`${oldServiceName}.`, `${newServiceName}.`),
                  )
                  return { ...variable, value: updatedValue }
                },
              )
            : []

          return {
            ...node,
            data: {
              ...node.data,
              variables: updatedVariables,
            },
          }
        }

        return node
      }),
    )
  }
  return (
    <div>
      <div
        onClick={handleEditClick}
        className={cn(
          'group inline-flex cursor-pointer items-center gap-x-2 rounded px-2 py-1 hover:bg-muted-foreground/10',
          className,
        )}>
        <p className='flex-grow truncate'>{service.name}</p>
        <SquarePen
          className='hidden flex-shrink-0 group-hover:block'
          size={16}
        />
      </div>

      {/* Edit Service Name Dialog */}
      <Dialog modal open={ediServiceName} onOpenChange={setEditServiceName}>
        <DialogContent onCloseAutoFocus={() => setServiceName(service?.name)}>
          <DialogHeader>
            <DialogTitle>Update service name</DialogTitle>
          </DialogHeader>
          <Input
            id='serviceName'
            value={serviceName}
            placeholder={service?.name || 'Enter service name'}
            onChange={e => setServiceName(slugify(e.target.value))}
            type='text'
            required
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const trimmed = serviceName.trim()
                if (trimmed === '') return
                updateServiceName(trimmed)
                setEditServiceName(false)
                onClose && onClose()
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EditServiceName
