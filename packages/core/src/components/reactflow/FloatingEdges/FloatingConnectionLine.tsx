import {
  ConnectionLineComponentProps,
  Node,
  getBezierPath,
} from '@xyflow/react'

import { getEdgeParams } from './utils'

const FloatingConnectionLine: React.FC<ConnectionLineComponentProps> = ({
  toX,
  toY,
  fromPosition,
  toPosition,
  fromNode,
}) => {
  if (!fromNode) {
    return null
  }

  // Mock target node at the cursor position
  const targetNode: Partial<Node> = {
    id: 'connection-target',
    measured: {
      width: 1,
      height: 1,
    },
    //@ts-ignore
    internals: {
      positionAbsolute: { x: toX, y: toY },
    },
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    //@ts-ignore
    fromNode,
    targetNode as Node,
  )

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos || fromPosition,
    targetPosition: targetPos || toPosition,
    targetX: tx || toX,
    targetY: ty || toY,
  })

  return (
    <g>
      <path
        fill='none'
        stroke='#222'
        strokeWidth={1.5}
        className='animated'
        d={edgePath}
      />
      <circle
        cx={tx || toX}
        cy={ty || toY}
        fill='#fff'
        r={3}
        stroke='#222'
        strokeWidth={1.5}
      />
    </g>
  )
}

export default FloatingConnectionLine
