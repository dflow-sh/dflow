'use client'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { DialogFooter } from '../ui/dialog'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  host: z.string(),
  certificateType: z.enum(['letsencrypt', 'none']),
  autoRegenerateSSL: z.boolean().optional().default(false),
})

const DomainForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-8'>
          <FormField
            control={form.control}
            name='host'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='certificateType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a database' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='letsencrypt'>letsencrypt</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardContent className='pt-4'>
              <h3 className='text-sm font-semibold'>HTTPS</h3>
              <div className='flex w-full items-center justify-between'>
                <p className='text-muted-foreground'>
                  Enable automatic regeneration of SSL certificate
                </p>

                <FormField
                  control={form.control}
                  name='autoRegenerateSSL'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type='submit'>Create</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}

export default DomainForm
