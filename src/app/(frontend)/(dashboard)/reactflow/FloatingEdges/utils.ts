import { Node, Position } from '@xyflow/react'

type MeasuredNode = Pick<Node, 'id'> & {
  measured: {
    width: number
    height: number
  }
  internals: {
    positionAbsolute: {
      x: number
      y: number
    }
  }
}

/**
 * Calculates the intersection point between the line from center of source to target node.
 */
function getNodeIntersection(
  intersectionNode: MeasuredNode,
  targetNode: MeasuredNode,
): { x: number; y: number } {
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute
  const targetPosition = targetNode.internals.positionAbsolute

  const w = intersectionNodeWidth / 2
  const h = intersectionNodeHeight / 2

  const x2 = intersectionNodePosition.x + w
  const y2 = intersectionNodePosition.y + h
  const x1 = targetPosition.x + targetNode.measured.width / 2
  const y1 = targetPosition.y + targetNode.measured.height / 2

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h)
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h)
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1))
  const xx3 = a * xx1
  const yy3 = a * yy1
  const x = w * (xx3 + yy3) + x2
  const y = h * (-xx3 + yy3) + y2

  return { x, y }
}

/**
 * Returns the side of the node the edge intersects (top, bottom, left, right).
 */
function getEdgePosition(
  node: MeasuredNode,
  intersectionPoint: { x: number; y: number },
): Position {
  const n = { ...node.internals.positionAbsolute, ...node }
  const nx = Math.round(n.x)
  const ny = Math.round(n.y)
  const px = Math.round(intersectionPoint.x)
  const py = Math.round(intersectionPoint.y)

  if (px <= nx + 1) {
    return Position.Left
  }
  if (px >= nx + node.measured.width - 1) {
    return Position.Right
  }
  if (py <= ny + 1) {
    return Position.Top
  }
  if (py >= ny + node.measured.height - 1) {
    return Position.Bottom
  }

  return Position.Top
}

/**
 * Returns coordinates and directions to draw a custom edge.
 */
export function getEdgeParams(
  source: MeasuredNode,
  target: MeasuredNode,
): {
  sx: number
  sy: number
  tx: number
  ty: number
  sourcePos: Position
  targetPos: Position
} {
  const sourceIntersectionPoint = getNodeIntersection(source, target)
  const targetIntersectionPoint = getNodeIntersection(target, source)

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint)
  const targetPos = getEdgePosition(target, targetIntersectionPoint)

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  }
}
