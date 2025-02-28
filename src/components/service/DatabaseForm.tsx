'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Service } from '@/payload-types'

const formSchema = z.object({
  port: z.string({ message: 'Port is required' }),
})

const PortForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  return (
    <div className='rounded border p-4'>
      <h3 className='text-lg font-semibold'>External Credentials</h3>
      <p className='text-pretty text-muted-foreground'>
        In order to make your database reachable over internet setting a port is
        required. make sure port is not used by other database or application
      </p>

      <Form {...form}>
        <form className='mt-4 space-y-8'>
          <FormField
            control={form.control}
            name='port'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input type='number' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex w-full justify-end'>
            <Button type='submit' variant='outline'>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

const DatabaseForm = ({ service }: { service: Service }) => {
  const { databaseDetails } = service

  return (
    <>
      <div className='space-y-4 rounded border p-4'>
        <h3 className='text-lg font-semibold'>Internal Credentials</h3>

        <form className='w-full space-y-8'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Username</Label>
              <Input disabled value={databaseDetails?.username ?? '-'} />
            </div>

            <div className='space-y-2'>
              <Label>Password</Label>
              <Input disabled value={databaseDetails?.password ?? '-'} />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Port</Label>
              <Input disabled value={databaseDetails?.port ?? '-'} />
            </div>

            <div className='space-y-2'>
              <Label>Host</Label>
              <Input disabled value={databaseDetails?.host ?? '-'} />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Internal connection url</Label>
              <Input disabled value={databaseDetails?.connectionUrl ?? '-'} />
            </div>

            <div>
              <Label>Status</Label>

              <p>{databaseDetails?.status ?? '-'}</p>
            </div>
          </div>
        </form>
      </div>

      <PortForm />
    </>
  )
}

export default DatabaseForm
