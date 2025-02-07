'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

const options = [
  {
    label: 'Database',
    value: 'database',
  },
  {
    label: 'App',
    value: 'app',
  },
  {
    label: 'Docker',
    value: 'docker',
  },
]

const CreateService = () => {
  const [open, setOpen] = useState(false)
  const params = useParams<{ id: string }>()

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
