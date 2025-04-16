'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tag, TagInput } from 'emblor'
import { X } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServiceAction } from '@/actions/service'
import { updateServiceSchema } from '@/actions/service/validator'
import {
  Form,
  FormControl,
  FormDescription,
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
import { numberRegex } from '@/lib/constants'
import { DockerRegistry, Service } from '@/payload-types'

const DockerForm = ({
  accounts,
  service,
}: {
  accounts: DockerRegistry[]
  service: Service
}) => {
  const { dockerDetails } = service
  const [ports, setPorts] = useState<Tag[]>(
    dockerDetails?.ports?.length
      ? dockerDetails?.ports?.map((port, index) => ({
          text: `${port}`,
          id: `${new Date().getTime() + index}`,
        }))
      : [],
  )
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  const { execute: saveDockerRegistryDetails, isPending } = useAction(
    updateServiceAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success('Successfully updated details')
        }
      },
    },
  )

  const form = useForm<z.infer<typeof updateServiceSchema>>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      dockerDetails: {
        url: dockerDetails?.url ?? '',
        account: dockerDetails?.account
          ? typeof dockerDetails?.account === 'object'
            ? dockerDetails?.account?.id
            : dockerDetails?.account
          : '',
      },
      id: service.id,
    },
  })

  function onSubmit(values: z.infer<typeof updateServiceSchema>) {
    const details = values?.dockerDetails
      ? {
          dockerDetails: {
            ...values.dockerDetails,
            ...(ports.length
              ? {
                  ports: ports.map(({ text }) => +text),
                }
              : {}),
          },
        }
      : {}

    saveDockerRegistryDetails({ ...details, id: service.id })
  }

  const { dockerDetails: dockerFieldDetails } = useWatch({
    control: form.control,
  })

  return (
    <div className='space-y-4 rounded bg-muted/30 p-4'>
      <h3 className='text-lg font-semibold'>Registry Details</h3>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='dockerDetails.account'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>

                  <div className='flex items-center gap-2'>
                    <Select
                      key={dockerFieldDetails?.account}
                      onValueChange={value => {
                        field.onChange(value)
                      }}
                      defaultValue={field.value}>
                      <FormControl>
                        <div className='relative w-full'>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select a account' />
                          </SelectTrigger>

                          {dockerFieldDetails?.account && (
                            <div
                              className='absolute right-8 top-2.5 cursor-wait'
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
                        {accounts.map(({ id, name }) => (
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-2'>
            <Label>Ports</Label>
            <TagInput
              tags={ports}
              setTags={newTags => {
                if (Array.isArray(newTags)) {
                  setPorts(newTags.filter(tag => numberRegex.test(tag.text)))
                }
              }}
              styleClasses={{
                input: 'bg-transparent',
                inlineTagsContainer: 'bg-transparent',
              }}
              activeTagIndex={activeTagIndex}
              setActiveTagIndex={setActiveTagIndex}
            />
          </div>

          <div className='flex w-full justify-end'>
            <Button type='submit' variant='outline' disabled={isPending}>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default DockerForm
