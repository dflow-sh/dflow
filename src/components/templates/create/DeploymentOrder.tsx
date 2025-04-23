'use client'

import { Node } from '@xyflow/react'
import {
  MotionValue,
  Reorder,
  animate,
  useDragControls,
  useMotionValue,
} from 'framer-motion'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface ReorderListProps {
  nodes: Node[]
  setNodes: (nodes: Node[]) => void
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
    <div className='w-64 space-y-1 rounded-md border bg-border p-2 backdrop-blur-md'>
      <h2 className='text-md text-left font-semibold'>Deployment order</h2>
      <Reorder.Group
        className='max-h-[320px] space-y-1 overflow-y-auto'
        axis='y'
        values={nodes}
        onReorder={setNodes}>
        {nodes.map(node => (
          <Item key={node.id} item={node} />
        ))}
      </Reorder.Group>
    </div>
  )
}

interface ItemProps {
  item: Node
}

const Item = ({ item }: ItemProps) => {
  const y = useMotionValue(0)
  const boxShadow = useRaisedShadow(y)
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={true} // Allow dragging
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        'flex items-center justify-between rounded-sm bg-card px-3 py-2',
        isDragging ? 'cursor-grabbing bg-card/80' : 'cursor-grab',
      )}>
      <span>{item.id}</span>
    </Reorder.Item>
  )
}
