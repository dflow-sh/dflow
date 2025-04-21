import { Node, useReactFlow } from '@xyflow/react'
import { motion } from 'framer-motion'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import { MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '@/components/icons'
import { ServiceNode } from '@/components/reactflow/types'

import { getPositionForNewNode } from './CreateNewTemplate'

type DatabaseType = 'postgres' | 'mongo' | 'mysql' | 'redis' | 'mariadb'
const AddDatabaseService = ({
  nodes,
  setNodes,
  setOpen,
}: {
  nodes: Node[]
  setNodes: Function
  setOpen: Function
}) => {
  const { fitView } = useReactFlow()

  const databases = [
    {
      id: 1,
      text: 'MongoDB',
      type: 'mongo',
      icon: <MongoDB className='size-6' />,
    },
    {
      id: 2,
      text: 'PostgreSQL',
      type: 'postgres',
      icon: <PostgreSQL className='size-6' />,
    },
    {
      id: 3,
      text: 'Redis',
      type: 'redis',
      icon: <Redis className='size-6' />,
    },
    {
      id: 4,
      text: 'MariaDB',
      type: 'mariadb',
      icon: <MariaDB className='size-6' />,
    },
    {
      id: 5,
      text: 'MySQL',
      type: 'mysql',
      icon: <MySQL className='size-6' />,
    },
  ]

  const addDatabaseNode = (type: DatabaseType) => {
    const name = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      style: 'lowerCase',
      length: 2,
    })
    const newNode: ServiceNode = {
      type: 'database',
      id: name,
      environmentVariables: {},
      databaseDetails: {
        type: type,
      },
    }

    setNodes((prev: Node[]) => [
      ...prev,
      {
        id: name,
        data: { ...newNode },
        position: getPositionForNewNode(nodes?.length),
        type: 'custom',
      },
    ])
    setOpen(false)
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 500 })
    }, 100)
  }
  return (
    <motion.div
      initial={{ x: '5%', opacity: 0.25 }}
      animate={{ x: 0, opacity: [0.25, 1] }}
      exit={{ x: '100%', opacity: 1 }}
      className='w-full'>
      {databases.map(database => {
        return (
          <div
            onClick={() => addDatabaseNode(database?.type as DatabaseType)}
            key={database.id}
            className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-4 overflow-y-hidden rounded-md py-3 pl-4 hover:bg-card'>
            <div className='flex items-center justify-between'>
              <div className='inline-flex items-center gap-x-2'>
                {database?.icon}
                <p>{database?.text}</p>
              </div>
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}

export default AddDatabaseService
