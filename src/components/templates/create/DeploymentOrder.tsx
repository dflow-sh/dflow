'use client'

import { Node } from '@xyflow/react'
import {
  DragControls,
  MotionValue,
  Reorder,
  animate,
  useDragControls,
  useMotionValue,
} from 'framer-motion'
import { useEffect } from 'react'

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
      <h2 className='text-md text-left font-bold'>Deployment Order</h2>
      <Reorder.Group
        className='scrollbar-hide max-h-[320px] space-y-1 overflow-y-scroll'
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

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={true} // Allow dragging
      dragControls={dragControls}
      className='flex items-center justify-between rounded-sm bg-card px-3 py-2'>
      <span>{item.id}</span>
      <ReorderIcon dragControls={dragControls} />
    </Reorder.Item>
  )
}

interface IconProps {
  dragControls: DragControls
}

function ReorderIcon({ dragControls }: IconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 39 39'
      width='16'
      height='16'
      style={{ cursor: 'grab' }}
      onPointerDown={event => dragControls.start(event)}>
      {[0, 14, 28].flatMap(y =>
        [0, 14].map(x => (
          <circle key={`${x}-${y}`} cx={x + 5} cy={y + 5} r='4' fill='#888' />
        )),
      )}
    </svg>
  )
}
