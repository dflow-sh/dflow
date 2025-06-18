import { Node, useReactFlow } from '@xyflow/react'
import { Tag, TagInput } from 'emblor'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import { MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '@/components/icons'
import { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import { numberRegex } from '@/lib/constants'

import { getPositionForNewNode } from './ChooseService'

type DatabaseType = 'postgres' | 'mongo' | 'mysql' | 'redis' | 'mariadb'

const AddDatabaseService = ({
  nodes,
  setNodes,
  setOpen,
  handleOnClick,
}: {
  nodes: Node[]
  setNodes: Function
  setOpen: Function
  handleOnClick?: Function
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
      name,
      variables: [],
      databaseDetails: {
        type: type,
      },
    }

    setNodes((prev: Node[]) => [
      ...prev,
      {
        id: name,
        data: {
          ...newNode,
          ...(handleOnClick && {
            onClick: () => handleOnClick({ serviceId: name }),
          }),
        },
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
            className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-4 overflow-y-hidden rounded-md py-3 pl-4 hover:bg-card/30'>
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

export const PortForm = ({
  service,
  setNodes,
}: {
  service: ServiceNode
  setNodes: Function
}) => {
  const [tags, setTags] = useState<Tag[]>(
    service.databaseDetails?.exposedPorts
      ? service.databaseDetails?.exposedPorts.map(port => ({
          id: port,
          text: port,
        }))
      : [],
  )
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  const updateDatabase = () => {
    console.log('Clicked', tags)
    setNodes((prevNodes: Node[]) =>
      prevNodes.map(node => {
        if (node.id === service?.id && service?.type === 'database') {
          return {
            ...node,
            data: {
              ...node?.data,
              databaseDetails: {
                ...(node?.data?.databaseDetails || {}),
                exposedPorts: tags.map(({ text }) => text),
              },
            },
          }
        }
        return node
      }),
    )
    toast.success('Ports updated successfully')
  }

  return (
    <motion.div
      initial={{ x: '5%', opacity: 0.25 }}
      animate={{ x: 0, opacity: [0.25, 1] }}
      exit={{ x: '100%', opacity: 1 }}
      className='w-full space-y-2 pt-2'>
      <h3 className='text-md font-semibold'>External Credentials </h3>
      <p className='text-pretty text-muted-foreground'>
        In order to make your database reachable over internet setting a port is
        required. make sure port is not used by other database or application
      </p>

      <div className='mt-4 space-y-6'>
        <TagInput
          placeholder='Enter ports'
          type='number'
          placeholderWhenFull='Max ports reached'
          tags={tags}
          setTags={newTags => {
            if (Array.isArray(newTags)) {
              setTags(newTags.filter(tag => numberRegex.test(tag.text)))
            }
          }}
          maxTags={service.databaseDetails?.type === 'mongo' ? 4 : 1}
          activeTagIndex={activeTagIndex}
          setActiveTagIndex={setActiveTagIndex}
        />

        <div className='flex w-full justify-end'>
          <Button
            type='submit'
            variant='outline'
            disabled={!tags.length}
            onClick={() => {
              if (
                service.databaseDetails?.type === 'mongo' &&
                tags.length < 4
              ) {
                return toast.error('Mongo database requires 4 ports', {
                  description: 'example ports: 27017, 27018, 27019, 27020',
                })
              }

              if (!tags.length) {
                return toast.error('Ports are required')
              }
              updateDatabase()
            }}>
            Save
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
