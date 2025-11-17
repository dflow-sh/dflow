'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { setServiceNginxConfigAction } from '@/actions/service'
import { setServiceNginxConfigSchema } from '@/actions/service/validator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Service } from '@/payload-types'

type NginxConfigType = z.infer<typeof setServiceNginxConfigSchema>

const KeyValuePair = ({
  service,
  proxyData,
  proxyKey,
  showLabel = false,
}: {
  service: Service
  proxyData: { key: string; value: string }[]
  proxyKey: NginxConfigType['key']
  showLabel?: boolean
}) => {
  const form = useForm<NginxConfigType>({
    resolver: zodResolver(setServiceNginxConfigSchema),
    defaultValues: {
      serviceId: service.id,
      key: proxyKey,
    },
  })

  const { value: updatedValue } = useWatch({ control: form.control })

  const { execute, isPending } = useAction(setServiceNginxConfigAction, {
    onError: ({ error, input }) => {
      toast.error(`Failed to update ${input.key} parameter`, {
        description: error.serverError,
      })
    },
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        toast.success(`Successfully updated ${input.key} parameter`)
      }
    },
  })

  const metric = useMemo(() => {
    const proxyPair = proxyData.find(item => item.key === proxyKey)

    if (proxyPair) {
      form.setValue('value', proxyPair.value)
    }

    return proxyPair
  }, [proxyData])

  const handleSubmit = (data: NginxConfigType) => {
    execute(data)
  }

  return (
    <Form {...form}>
      <form
        className='grid grid-cols-[1fr_1fr_auto] gap-2'
        onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name='key'
          render={({ field }) => (
            <FormItem>
              {showLabel && <FormLabel>Property</FormLabel>}
              <FormControl>
                <Input
                  value={field.value}
                  className='pointer-events-none cursor-none'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='value'
          render={({ field }) => (
            <FormItem>
              {showLabel && <FormLabel>Value</FormLabel>}
              <FormControl>
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          isLoading={isPending}
          disabled={isPending || metric?.value === updatedValue}
          type='submit'
          className='place-self-end'
          variant={'outline'}>
          Save
        </Button>
      </form>
    </Form>
  )
}

const NginxConfigurationTab = ({
  service,
  proxyData,
}: {
  service: Service
  proxyData: { key: string; value: string }[]
}) => {
  return (
    <div className='space-y-2'>
      <KeyValuePair
        proxyKey='client-max-body-size'
        showLabel
        proxyData={proxyData}
        service={service}
      />
      <KeyValuePair
        proxyKey='client-body-timeout'
        proxyData={proxyData}
        service={service}
      />
      <KeyValuePair
        proxyKey='client-header-timeout'
        proxyData={proxyData}
        service={service}
      />
    </div>
  )
}

export default NginxConfigurationTab
