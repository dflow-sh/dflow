'use client'

import { Node } from '@xyflow/react'
import { Database, Github, GripVertical } from 'lucide-react'
import {
  MotionValue,
  Reorder,
  animate,
  useDragControls,
  useMotionValue,
} from 'motion/react'
import { JSX, useEffect, useState } from 'react'

import {
  Docker,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '@/components/icons'
import { ServiceNode } from '@/components/reactflow/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

interface ReorderListProps {
  nodes: Node[]
  setNodes: (nodes: Node[]) => void
}

type StatusType = NonNullable<
  NonNullable<ServiceNode['databaseDetails']>['type']
>

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-6' />,
  mariadb: <MariaDB className='size-6' />,
  mongo: <MongoDB className='size-6' />,
  mysql: <MySQL className='size-6' />,
  redis: <Redis className='size-6' />,
}

const icon: { [key in ServiceNode['type']]: JSX.Element } = {
  app: <Github className='size-6' />,
  database: <Database className='size-6 text-destructive' />,
  docker: <Docker className='size-6' />,
}

const inactiveShadow = '0px 0px 0px rgba(0,0,0,0.8)'

export function useRaisedShadow(value: MotionValue<number>) {
  const boxShadow = useMotionValue(inactiveShadow)

  useEffect(() => {
    let isActive = false
    value.onChange(latest => {
      const wasActive = isActive
      if (latest !== 0) {
        isActive = true
        if (isActive !== wasActive) {
          animate(boxShadow, '5px 5px 10px rgba(0,0,0,0.3)')
        }
      } else {
        isActive = false
        if (isActive !== wasActive) {
          animate(boxShadow, inactiveShadow)
        }
      }
    })
  }, [value, boxShadow])

  return boxShadow
}

export default function ReorderList({ nodes, setNodes }: ReorderListProps) {
  return (
    <Accordion
      type='single'
      defaultValue='deployment-order'
      collapsible
      className='w-full'>
      <AccordionItem
        className='w-72 space-y-1 rounded-md border bg-[#171e33] px-3 backdrop-blur-md'
        value='deployment-order'>
        <AccordionTrigger className='px-2 hover:no-underline'>
          Deployment order
        </AccordionTrigger>
        <AccordionContent>
          <Reorder.Group
            className='max-h-[320px] space-y-1 overflow-y-auto'
            axis='y'
            values={nodes}
            onReorder={setNodes}>
            {nodes.map((node, index) => (
              <NodeComponent key={node.id} node={node} index={++index} />
            ))}
          </Reorder.Group>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const NodeComponent = ({ node, index }: { node: Node; index: number }) => {
  const y = useMotionValue(0)
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)

  const service = node.data as unknown as ServiceNode
  return (
    <Reorder.Item
      value={node}
      id={node.id}
      dragListener={true}
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        'relative flex items-center justify-between gap-2 rounded-sm bg-background px-3 py-2',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
      )}>
      <div className='mr-1 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-sm'>
        {index}
      </div>

      {service?.type === 'database' && service?.databaseDetails?.type
        ? databaseIcons[service?.databaseDetails?.type]
        : icon[service.type]}

      <span title={service.name} className='flex-grow truncate'>
        {service.name}
      </span>

      <GripVertical className='flex-shrink-0' size={16} />
    </Reorder.Item>
  )
}
