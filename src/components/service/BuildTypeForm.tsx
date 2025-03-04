'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServiceAction } from '@/actions/service'
import { updateServiceSchema } from '@/actions/service/validator'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Service } from '@/payload-types'

const options = [
  {
    label: 'Nixpacks',
    value: 'nixpacks',
  },
  {
    label: 'Dockerfile',
    value: 'dockerfile',
  },
  {
    label: 'Heroku Build Packs',
    value: 'herokuBuildPacks',
  },
  {
    label: 'Build Packs',
    value: 'buildPacks',
  },
]

const BuildTypeForm = ({ service }: { service: Service }) => {
  const params = useParams<{ id: string; serviceId: string }>()
  const form = useForm<z.infer<typeof updateServiceSchema>>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      id: params.serviceId,
      builder: service?.builder ?? undefined,
    },
  })

  const { execute, isPending } = useAction(updateServiceAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success('Successfully updated builder')
      }
    },
  })

  function onSubmit(data: z.infer<typeof updateServiceSchema>) {
    execute(data)
  }

  return (
    <div className='space-y-4 rounded bg-muted/30 p-4'>
      <div>
        <h3 className='text-lg font-semibold'>Built Type</h3>
        <p className='text-muted-foreground'>
          Select a type for building your code
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='builder'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className='flex flex-col space-y-1'>
                    {options.map(({ value, label }) => (
                      <FormItem
                        className='flex items-center space-x-3 space-y-0'
                        key={value}>
                        <FormControl>
                          <RadioGroupItem value={value} />
                        </FormControl>
                        <FormLabel className='font-normal'>{label}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex w-full justify-end'>
            <Button variant='outline' disabled={isPending} type='submit'>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default BuildTypeForm
