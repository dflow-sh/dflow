'use client'

import SidebarToggleButton from '../SidebarToggleButton'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, X } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServiceAction } from '@/actions/service'
import { updateServiceSchema } from '@/actions/service/validator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DockerRegistry, Service } from '@/payload-types'

const schema = ['http', 'https']

const DockerForm = ({
  accounts,
  service,
}: {
  accounts: DockerRegistry[]
  service: Service
}) => {
  const [imageType, setImageType] = useState(
    service?.dockerDetails?.account ? 'private' : 'public',
  )
  const { dockerDetails } = service

  const { execute: saveDockerRegistryDetails, isPending } = useAction(
    updateServiceAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.info('Successfully updated details', {
            description: 'Redeploy your app for latest changes',
          })
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to update details: ${error?.serverError}`)
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
        ports: dockerDetails?.ports ?? [],
      },
      id: service.id,
    },
  })

  const {
    fields,
    append: appendPort,
    remove: removePort,
  } = useFieldArray({
    control: form.control,
    name: 'dockerDetails.ports',
  })

  function onSubmit(values: z.infer<typeof updateServiceSchema>) {
    saveDockerRegistryDetails({ ...values, id: service.id })
  }

  const { dockerDetails: dockerFieldDetails } = useWatch({
    control: form.control,
  })

  return (
    <div className='space-y-4 rounded bg-muted/30 p-4'>
      <h3 className='text-lg font-semibold'>Registry Details</h3>

      <div className='space-y-2'>
        <RadioGroup
          value={imageType}
          onValueChange={setImageType}
          className='flex gap-6'>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='public' id='r2' />
            <Label htmlFor='r2'>Public</Label>
          </div>

          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='private' id='r3' />
            <Label htmlFor='r3'>Private</Label>
          </div>
        </RadioGroup>

        <p className='text-[0.8rem] text-muted-foreground'>
          Select private option to deploy private images
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-6'>
          <div
            className={`grid ${imageType === 'private' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <FormField
              control={form.control}
              name='dockerDetails.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    URL
                    <SidebarToggleButton
                      directory='services'
                      fileName='docker-service'
                      sectionId='#url'
                    />
                  </FormLabel>{' '}
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dockerDetails.account'
              render={({ field }) => (
                <FormItem
                  className={imageType === 'private' ? 'block' : 'hidden'}>
                  <FormLabel>Account</FormLabel>

                  <div className='flex items-center gap-2'>
                    <Select
                      key={dockerFieldDetails?.account}
                      onValueChange={value => {
                        field.onChange(value)
                      }}
                      disabled={!accounts.length}
                      defaultValue={field.value}>
                      <FormControl>
                        <div className='relative w-full'>
                          <SelectTrigger className='w-full'>
                            <SelectValue
                              placeholder={
                                !accounts.length
                                  ? 'No accounts found!'
                                  : 'Select a account'
                              }
                            />
                          </SelectTrigger>

                          {dockerFieldDetails?.account && (
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
                        {accounts.map(({ id, name }) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-2'>
            <Label className='block'>
              Ports
              <SidebarToggleButton
                directory='services'
                fileName='docker-service'
                sectionId='#ports'
              />
            </Label>
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
