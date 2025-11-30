import {
  EdgeProps,
  Position,
  getBezierPath,
  useInternalNode,
} from '@xyflow/react'
import { JSX } from 'react'

import { getEdgeParams } from './utils'

const FloatingEdge = ({
  id,
  source,
  target,
  markerEnd,
  style,
}: EdgeProps): JSX.Element | null => {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  if (!sourceNode || !targetNode) {
    return null
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    //@ts-ignore
    sourceNode,
    targetNode,
  )

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos as Position,
    targetPosition: targetPos as Position,
    targetX: tx,
    targetY: ty,
  })

  return (
    <path
      id={id}
      className='react-flow__edge-path'
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  )
}

export default FloatingEdge
