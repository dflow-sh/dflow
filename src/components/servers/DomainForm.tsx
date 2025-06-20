'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServerDomainAction } from '@/actions/server'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Server } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

const subdomainSchema = z.object({
  domain: z
    .string()
    .regex(
      /^(?![^.]+\.[^.]+$)([a-zA-Z0-9-]+)\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid subdomain format',
    ),
  defaultDomain: z.boolean().optional().default(true),
})

export const DomainFormWithoutDialog = ({
  server,
  setOpen,
}: {
  server: ServerType | Server
  setOpen?: Dispatch<SetStateAction<boolean>>
}) => {
  const pathName = usePathname()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof subdomainSchema>>({
    resolver: zodResolver(subdomainSchema),
    defaultValues: {
      domain: `${server.ip}.nip.io`,
      defaultDomain: false,
    },
  })

  const { execute, isPending, input } = useAction(updateServerDomainAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setOpen?.(false)
        form.reset()
        toast.info('Successfully added domain', {
          description: `Please add necessary records and sync domain`,
          duration: 2500,
        })

        if (pathName.includes('onboarding')) {
          setDialogOpen(true)
        }
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to add domain: ${error.serverError}`)
    },
  })

  function onSubmit(values: z.infer<typeof subdomainSchema>) {
    execute({
      operation: values.defaultDomain ? 'set' : 'add',
      id: server.id,
      domains: [values.domain],
    })
  }

  const parts = input?.domains?.[0]?.split('.')

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-6'>
          <FormField
            control={form.control}
            name='domain'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type='submit' isLoading={isPending} disabled={isPending}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </Form>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Domain Configuration</DialogTitle>
            <DialogDescription>
              Add the records in your domain provider, This step can be skipped
              for wildcard domains ex: nip.io, sslip.io
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[100px]'>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className='text-right'>TTL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className='font-medium'>A</TableCell>
                <TableCell>{`*.${parts?.splice(0, parts?.length - 2).join('.')}`}</TableCell>
                <TableCell>{server.ip}</TableCell>
                <TableCell className='text-right'>auto</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <DialogFooter>
            <Button
              onClick={() => {
                router.push('/onboarding/install-github')
              }}>
              I&apos;ve added records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const DomainForm = ({ server }: { server: ServerType | Server }) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button onClick={e => e.stopPropagation()}>
          <Plus /> Add Domain
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Please attach a subdomain example:{' '}
            <strong className='text-foreground'>app.mydomain.com</strong>
          </DialogDescription>
        </DialogHeader>

        <DomainFormWithoutDialog server={server} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

export default DomainForm
