'use client'

import DeployTemplateWithProjectForm from '../DeployTemplateWithProjectForm'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Edge,
  MarkerType,
  Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { useAction } from 'next-safe-action/hooks'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts'

import {
  createTemplateAction,
  getOfficialTemplateByIdAction,
  getTemplateByIdAction,
  updateTemplateAction,
} from '@dflow/core/actions/templates'
import {
  CreateTemplateSchemaType,
  createTemplateSchema,
} from '@dflow/core/actions/templates/validator'
import ReactFlowConfig from '@dflow/core/components/reactflow/reactflow.config'
import { convertNodesToServices } from '@dflow/core/components/reactflow/utils/convertNodesToServices'
import { convertToGraph } from '@dflow/core/components/reactflow/utils/convertServicesToNodes'
import { Button } from '@dflow/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@dflow/core/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@dflow/core/components/ui/form'
import { Input } from '@dflow/core/components/ui/input'
import { Skeleton } from '@dflow/core/components/ui/skeleton'
import { Textarea } from '@dflow/core/components/ui/textarea'

import ChooseService, { ChildRef, getPositionForNewNode } from './ChooseService'

type FlowStorage = {
  nodes: Node[]
  edges: Edge[]
}

const CreateNewTemplate = () => {
  const [openCreateTemplate, setOpenCreateTemplate] = useState<boolean>(false)
  const storedFlow = useReadLocalStorage<FlowStorage>('create-new-template')
  const { nodes: storedNodes, edges: storedEdges } = storedFlow ?? {
    nodes: [],
    edges: [],
  }
  const [flow, setFlow, removeFlow] = useLocalStorage<FlowStorage>(
    'create-new-template',
    {
      nodes: storedNodes,
      edges: storedEdges,
    },
  )
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const services = convertNodesToServices(nodes)
  const childRef = useRef<ChildRef>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')
  const type = searchParams.get('type')
  const { organisation } = useParams()
  let template: any

  const form = useForm<CreateTemplateSchemaType>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        style: 'lowerCase',
        length: 2,
      }),
      services: services,
    },
  })

  //create template api
  const { execute: createNewTemplate, isPending: isCreateNewTemplatePending } =
    useAction(createTemplateAction, {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Template created successfully`)
          router.push(`/${organisation}/templates${type ? `?tab=${type}` : ''}`)
          removeFlow()
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to create template ${error.serverError}`)
      },
    })

  const {
    execute: updateExistingTemplate,
    isPending: isUpdateTemplatePending,
  } = useAction(updateTemplateAction, {
    onSuccess: ({ data, input }) => {
      if (data) {
        toast.success(`Template updated successfully`)
        router.push(`/${organisation}/templates${type ? `?tab=${type}` : ''}`)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to update template ${error?.serverError}`)
    },
  })

  //getTemplateBYId api for personal templates
  const {
    execute: getTemplateById,
    isPending: isGetTemplateByIdPending,
    result: personalTemplate,
  } = useAction(getTemplateByIdAction, {
    onError: ({ error }) => {
      toast.error(`Failed to get template: ${error.serverError}`)
    },
  })

  const {
    execute: getOfficialTemplateById,
    isPending: isGetOfficialTemplateByIdPending,
    result: officialTemplate,
  } = useAction(getOfficialTemplateByIdAction, {
    onError: ({ error }) => {
      toast.error(`Failed to get template: ${error.serverError}`)
    },
  })

  const onSubmit = (data: CreateTemplateSchemaType) => {
    if (templateId && template?.data) {
      updateExistingTemplate({
        id: templateId,
        name: data.name,
        imageUrl: data?.imageUrl,
        description: data.description,
        services,
      })
    } else {
      createNewTemplate({
        name: data?.name,
        imageUrl: data?.imageUrl,
        description: data?.description,
        services,
      })
    }
  }

  const callChildFunction = (args: { serviceId: string }) => {
    childRef.current?.handleOnClick(args)
  }

  useEffect(() => {
    if (!templateId) {
      setFlow({ nodes, edges })
    }
  }, [nodes, edges])

  useEffect(() => {
    if (!templateId) {
      if (storedFlow?.nodes) {
        const initialNodes =
          storedNodes && storedNodes?.length > 0
            ? storedNodes?.map(node => ({
                ...node,
                data: {
                  ...node.data,
                  onClick: () => callChildFunction({ serviceId: node.id! }),
                },
                type: 'custom',
              }))
            : []
        setNodes(initialNodes || [])
        setEdges(storedEdges)
      }
      return
    }
    if (type === 'personal') {
      getTemplateById({ id: templateId })
    } else if (type === 'official' || type === 'community') {
      getOfficialTemplateById({ templateId })
    }
  }, [templateId, type])

  template =
    type === 'official' || type === 'community'
      ? officialTemplate
      : personalTemplate

  useEffect(() => {
    if (!template.data?.services) return
    form.setValue('name', template.data?.name ?? '')
    form.setValue('description', template?.data?.description ?? '')
    form.setValue('imageUrl', template.data?.imageUrl || '')

    const { edges: edgesData, nodes: nodesData } = convertToGraph(
      template?.data?.services!,
    )

    const initialNodes = nodesData?.map((node, index) => ({
      id: node.id,
      position: getPositionForNewNode(index),
      data: {
        ...node,
        onClick: () => callChildFunction({ serviceId: node.id! }),
      },
      type: 'custom',
    }))

    const initialEdges = edgesData.map(edge => ({
      ...edge,
      type: 'floating',
      style: { strokeDasharray: '5 5' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      label: 'Ref',
    }))

    setNodes(initialNodes || [])
    setEdges(initialEdges)
  }, [template.data?.services])

  if (isGetTemplateByIdPending || isGetOfficialTemplateByIdPending) {
    return (
      <ReactFlowConfig
        edges={[]}
        nodes={[]}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        className='h-[calc(100vh-120px)] w-full'>
        <div className='flex h-full w-full flex-col items-center justify-center gap-4 md:flex-row'>
          {/* Generate 6 skeleton card placeholders */}
          {Array(2)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className='text-card-foreground bg-muted/30 h-36 w-full rounded-xl border shadow-sm backdrop-blur-md md:w-72'>
                <div className='flex w-full flex-row justify-between space-y-1.5 p-6'>
                  <div className='flex items-center gap-x-3'>
                    <Skeleton className='size-6 rounded-full' />
                    <div className='flex-1 items-start'>
                      <Skeleton className='mb-2 h-5 w-32' />
                      <Skeleton className='h-4 w-24' />
                    </div>
                  </div>
                  <Skeleton className='h-9 w-9 shrink-0 rounded-md' />
                </div>
                <div className='flex items-center p-6 pt-0'>
                  <Skeleton className='h-4 w-36' />
                </div>
              </div>
            ))}
        </div>
      </ReactFlowConfig>
    )
  }

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-end gap-x-2 px-2 pt-2'>
        <DeployTemplateWithProjectForm services={services} />
        <Button
          variant={'default'}
          disabled={
            nodes?.length <= 0 || type === 'official' || type === 'community'
          }
          onClick={() => setOpenCreateTemplate(true)}>
          {templateId && template?.data ? 'Update template' : 'Save template'}
        </Button>
      </div>
      <ChooseService
        ref={childRef}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
      {/* Template creation */}
      <Dialog open={openCreateTemplate} onOpenChange={setOpenCreateTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {templateId && template?.data ? 'Update' : 'Create'} Template
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type='text' {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='imageUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input type='text' {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className='mt-4'>
                <Button
                  disabled={
                    isCreateNewTemplatePending ||
                    isUpdateTemplatePending ||
                    type === 'official' ||
                    type === 'community'
                  }
                  isLoading={
                    isCreateNewTemplatePending || isUpdateTemplatePending
                  }
                  type='submit'>
                  {templateId && template?.data ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateNewTemplate
