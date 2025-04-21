'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { ChevronRight, Database, Github, Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import { createTemplate } from '@/actions/templates'
import {
  CreateTemplateSchemaType,
  createTemplateSchema,
} from '@/actions/templates/validator'
import ReactFlowConfig from '@/components/reactflow/reactflow.config'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import AddDatabaseService from './AddDatabaseService'
import AddGithubService from './AddGithubService'

const convertNodesToServices = (nodes: any[]) => {
  return nodes.map(({ data }) => ({
    name: data?.id,
    ...data,
  }))
}

export const getPositionForNewNode = (
  index: number,
): { x: number; y: number } => {
  const baseX = 500
  const baseY = 200

  const spacingX = 320
  const spacingY = 220

  const columns = 3 // max columns per row

  const column = index % columns
  const row = Math.floor(index / columns)

  return {
    x: baseX + column * spacingX,
    y: baseY + row * spacingY,
  }
}

const CreateNewTemplate = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [openCreateTemplate, setOpenCreateTemplate] = useState<boolean>(false)
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const [showGithub, setShowGithub] = useState<boolean>(false)
  const [showDatabases, setShowDatabases] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const router = useRouter()

  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<CreateTemplateSchemaType>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        style: 'lowerCase',
        length: 2,
      }),
      services: convertNodesToServices(nodes),
    },
  })

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  const handleShowGithubRepoClick = () => {
    setShowOptions(true)
    setShowGithub(true)
  }
  const handleShowDatabaseClick = () => {
    setShowOptions(true)
    setShowDatabases(true)
  }
  const resetDialog = () => {
    setSearchQuery('')
    setShowDatabases(false)
    setShowGithub(false)
    setShowOptions(false)
  }

  const mainOptions = [
    {
      id: 1,
      text: 'Github Repo',
      icon: <Github className='h-[18px] w-[18px]' />,
      isDisabled: false,
      onClick: handleShowGithubRepoClick,
      chevronRightDisable: true,
    },
    {
      id: 2,
      text: 'Database',
      icon: <Database size={18} stroke='#3fa037' />,
      isDisabled: false,
      onClick: handleShowDatabaseClick,
      chevronRightDisable: false,
    },
  ]

  const filteredOptions = mainOptions.filter(option =>
    option.text.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const { execute: createNewTemplate, isPending: isCreateNewTemplatePending } =
    useAction(createTemplate, {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Template created successfully`)
          router.push('/templates')
          setOpen(false)
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to create template`)
      },
    })

  const onSubmit = (data: CreateTemplateSchemaType) => {
    createNewTemplate({
      name: data?.name,
      description: data?.description,
      services: convertNodesToServices(nodes),
    })
  }
  console.log('nodes', nodes)
  console.log('errors', errors)
  return (
    <ReactFlowConfig
      nodes={nodes}
      edges={edges}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}>
      <section className='mx-auto w-full max-w-6xl p-4'>
        <div className='flex w-full items-center justify-end gap-x-2'>
          <Button
            className='z-20'
            variant={'outline'}
            onClick={() => setOpen(true)}>
            <Plus size={16} /> Add New
          </Button>
          <Button
            className='z-20'
            variant={'default'}
            disabled={nodes?.length <= 0}
            onClick={() => setOpenCreateTemplate(true)}>
            Create Template
          </Button>
        </div>

        {/* service creation */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent onCloseAutoFocus={resetDialog}>
            <DialogHeader>
              <DialogTitle>Add Service</DialogTitle>
            </DialogHeader>
            {!showOptions ? (
              <>
                <Input
                  placeholder='Add a server'
                  value={searchQuery}
                  onChange={e => {
                    handleSearchChange(e)
                  }}
                />
                <AnimatePresence mode='wait' initial={false}>
                  <MotionConfig
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}>
                    {!showOptions && (
                      <motion.div
                        key='main-options'
                        initial={{ x: '-75%', opacity: 0.25 }}
                        animate={{ x: 0, opacity: [0.25, 1] }}
                        exit={{ x: '-100%', opacity: 1 }}
                        className='w-full'>
                        <ul className='px-2 py-3 text-left'>
                          {filteredOptions.length === 0 ? (
                            <div>There is no such thing as {searchQuery}</div>
                          ) : (
                            filteredOptions.map(option => (
                              <li
                                key={option.id}
                                className={`flex items-center justify-between rounded-md p-3 text-base hover:bg-card ${
                                  option.isDisabled
                                    ? 'cursor-not-allowed text-primary-foreground'
                                    : 'cursor-pointer hover:text-base focus:bg-card'
                                }`}
                                onClick={
                                  !option.isDisabled
                                    ? option.onClick
                                    : undefined
                                }>
                                <div className='flex items-center gap-x-3'>
                                  {option.icon}
                                  <div className='select-none'>
                                    {option.text}
                                  </div>
                                </div>
                                {!option.isDisabled &&
                                  !option.chevronRightDisable && (
                                    <ChevronRight
                                      size={17}
                                      className='justify-end'
                                    />
                                  )}
                              </li>
                            ))
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </MotionConfig>
                </AnimatePresence>
              </>
            ) : showOptions && showDatabases ? (
              <AddDatabaseService
                nodes={nodes}
                setNodes={setNodes}
                setOpen={setOpen}
              />
            ) : showOptions && showGithub ? (
              <AddGithubService
                setOpen={setOpen}
                nodes={nodes}
                setNodes={setNodes}
              />
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Template creation */}
        <Dialog open={openCreateTemplate} onOpenChange={setOpenCreateTemplate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='space-y-4'>
                <div>
                  <Label>
                    Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input {...register('name')} />
                  {errors.name?.message && <p>{errors.name?.message}</p>}
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea {...register('description')} className='min-h-44' />
                </div>
              </div>
              <DialogFooter className='mt-4'>
                <Button disabled={isCreateNewTemplatePending} type='submit'>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    </ReactFlowConfig>
  )
}
export default CreateNewTemplate
