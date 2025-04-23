import { zodResolver } from '@hookform/resolvers/zod'
import { Node, useReactFlow } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import { getDockerRegistries } from '@/actions/dockerRegistry'
import { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { getPositionForNewNode } from './CreateNewTemplate'
import { DockerServiceSchema, DockerServiceType } from './types'

const schema = ['http', 'https']

const AddDockerService = ({
  nodes,
  setNodes,
  setOpen,
}: {
  nodes: Node[]
  setNodes: Function
  setOpen: Function
}) => {
  const { fitView } = useReactFlow()
  const form = useForm<DockerServiceType>({
    resolver: zodResolver(DockerServiceSchema),
  })
  const {
    fields,
    append: appendPort,
    remove: removePort,
  } = useFieldArray({
    control: form.control,
    name: 'dockerDetails.ports',
  })

  const { dockerDetails } = useWatch({
    control: form.control,
  })

  const {
    execute,
    isPending,
    result: accounts,
  } = useAction(getDockerRegistries)

  const addDockerNode = (data: DockerServiceType) => {
    const name = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      style: 'lowerCase',
      length: 2,
    })
    const newNode: ServiceNode = {
      type: 'docker',
      id: name,
      name,
      environmentVariables: {},
      ...data,
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

  useEffect(() => {
    execute()
  }, [])
  return (
    <motion.div
      initial={{ x: '5%', opacity: 0.25 }}
      animate={{ x: 0, opacity: [0.25, 1] }}
      exit={{ x: '100%', opacity: 1 }}
      className='w-full'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(addDockerNode)}
          className='w-full space-y-4'>
          <FormField
            control={form.control}
            name='dockerDetails.account'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>

                <div className='flex items-center gap-2'>
                  <Select
                    key={dockerDetails?.account}
                    onValueChange={value => {
                      field.onChange(value)
                    }}
                    value={field.value}
                    disabled={isPending}>
                    <FormControl>
                      <div className='relative w-full'>
                        <SelectTrigger className='w-full'>
                          <SelectValue
                            placeholder={
                              isPending
                                ? 'Fetching accounts...'
                                : 'Select a account'
                            }
                          />
                        </SelectTrigger>

                        {dockerDetails?.account && (
                          <div
                            className='absolute right-8 top-2.5 cursor-pointer text-muted-foreground'
                            onClick={e => {
                              form.setValue('dockerDetails.account', '', {
                                shouldValidate: true,
                              })
                            }}>
                            <X size={16} />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <SelectContent>
                      {accounts.data?.map(({ id, name }) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormDescription>
                  Select a account to deploy private images
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dockerDetails.url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='space-y-2'>
            <Label className='block'>Ports</Label>

            {fields.length ? (
              <div className='grid grid-cols-[1fr_1fr_1fr_2.5rem] gap-4 text-sm text-muted-foreground'>
                <p className='font-semibold'>Host Port</p>
                <p className='font-semibold'>Container Port</p>
                <p className='font-semibold'>Schema</p>
              </div>
            ) : null}

            {fields.map((field, index) => {
              return (
                <div
                  key={field?.id ?? index}
                  className='grid grid-cols-[1fr_1fr_1fr_2.5rem] gap-4'>
                  <FormField
                    control={form.control}
                    name={`dockerDetails.ports.${index}.hostPort`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={e => {
                              const value = e.target.value
                                ? parseInt(e.target.value, 10)
                                : 0
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`dockerDetails.ports.${index}.containerPort`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={e => {
                              const value = e.target.value
                                ? parseInt(e.target.value, 10)
                                : 0
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`dockerDetails.ports.${index}.scheme`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a schema' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schema.map(item => (
                              <SelectItem value={item} key={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    variant='ghost'
                    type='button'
                    size='icon'
                    onClick={() => {
                      removePort(index)
                    }}>
                    <Trash2 className='text-destructive' />
                  </Button>
                </div>
              )
            })}

            <Button
              type='button'
              variant='outline'
              onClick={() => {
                appendPort({
                  containerPort: 3000,
                  hostPort: 80,
                  scheme: 'http',
                })
              }}>
              <Plus /> Add
            </Button>
          </div>

          <div className='flex w-full justify-end'>
            <Button type='submit' disabled={!dockerDetails?.url}>
              Add
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

export default AddDockerService
