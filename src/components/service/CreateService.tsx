'use client'

import { MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '../icons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Fragment, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createServiceAction } from '@/actions/service'
import { createServiceSchema } from '@/actions/service/validator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { slugify } from '@/lib/slugify'
import { Server } from '@/payload-types'

const options = [
  {
    label: 'Database',
    value: 'database',
  },
  {
    label: 'App (Git based application)',
    value: 'app',
  },
  // {
  //   label: 'Docker',
  //   value: 'docker',
  // },
]

const databaseOptions = [
  {
    label: 'Postgres',
    value: 'postgres',
    icon: PostgreSQL,
  },
  {
    label: 'MongoDB',
    value: 'mongo',
    icon: MongoDB,
  },
  {
    label: 'MySQL',
    value: 'mysql',
    icon: MySQL,
  },
  {
    label: 'MariaDB',
    value: 'mariadb',
    icon: MariaDB,
  },
  {
    label: 'Redis',
    value: 'redis',
    icon: Redis,
  },
]

const CreateService = ({ server }: { server: Server }) => {
  const [open, setOpen] = useState(false)
  const params = useParams<{ id: string }>()
  const { plugins = [] } = server

  const { execute, isPending } = useAction(createServiceAction, {
    onSuccess: ({ data, input }) => {
      if (data) {
        toast.success(`Successfully created ${input.name} service`)
        setOpen(false)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to create service: ${error.serverError}`)
    },
  })

  const form = useForm<z.infer<typeof createServiceSchema>>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: '',
      projectId: params.id,
    },
  })

  const { type } = useWatch({ control: form.control })

  function onSubmit(values: z.infer<typeof createServiceSchema>) {
    execute(values)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus />
            Create Service
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new service</DialogTitle>
            <DialogDescription className='sr-only'>
              This will create a new service
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='w-full space-y-8'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={e => {
                          form.setValue('name', slugify(e.target.value), {
                            shouldValidate: true,
                          })
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === 'database' && (
                <FormField
                  control={form.control}
                  name='databaseType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {databaseOptions.map(
                            ({ label, value, icon: Icon }) => {
                              const optionDisabled =
                                !plugins ||
                                !plugins.find(
                                  plugin => plugin.name === value,
                                ) ||
                                plugins.find(plugin => plugin.name === value)
                                  ?.status === 'disabled'

                              return (
                                <Fragment key={value}>
                                  <SelectItem
                                    value={value}
                                    disabled={optionDisabled}>
                                    <span className='flex gap-2'>
                                      <Icon className='size-5' />
                                      {label}
                                    </span>
                                  </SelectItem>

                                  {optionDisabled && (
                                    <p className='px-2 text-sm'>
                                      {`To use ${label} install/enable ${value}-plugin at `}
                                      <Link
                                        className='text-primary underline'
                                        href={`/settings/servers/${server.id}/general`}>
                                        server-page
                                      </Link>
                                    </p>
                                  )}
                                </Fragment>
                              )
                            },
                          )}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='submit' disabled={isPending}>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateService
