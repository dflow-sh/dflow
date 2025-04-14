import { addEdge, useEdgesState, useNodesState } from '@xyflow/react'
import { useEffect } from 'react'

const NODES_KEY = 'flow-nodes'
const EDGES_KEY = 'flow-edges'

export function useFlowPersistence(
  defaultNodes: any[] = [],
  defaultEdges: any[] = [],
) {
  const savedNodes =
    typeof window !== 'undefined'
      ? JSON.parse(sessionStorage.getItem(NODES_KEY) || 'null')
      : null

  const savedEdges =
    typeof window !== 'undefined'
      ? JSON.parse(sessionStorage.getItem(EDGES_KEY) || 'null')
      : null

  const [nodes, setNodes, onNodesChange] = useNodesState(
    savedNodes || defaultNodes,
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    savedEdges || defaultEdges,
  )

  const onConnect = (params: any) => {
    setEdges(eds => addEdge(params, eds))
  }

  // Persist changes to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(NODES_KEY, JSON.stringify(nodes))
  }, [nodes])

  useEffect(() => {
    sessionStorage.setItem(EDGES_KEY, JSON.stringify(edges))
  }, [edges])

  const resetFlow = () => {
    sessionStorage.removeItem(NODES_KEY)
    sessionStorage.removeItem(EDGES_KEY)
    setNodes(defaultNodes)
    setEdges(defaultEdges)
  }

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    resetFlow,
  }
}
