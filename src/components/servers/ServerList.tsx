'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Server, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { deleteServerAction } from '@/actions/server'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Server as ServerType, SshKey } from '@/payload-types'

const ServerList = ({
  servers,
  sshKeys,
}: {
  servers: ServerType[]
  sshKeys: SshKey[]
}) => {
  const { execute, isPending } = useAction(deleteServerAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Successfully deleted Server`)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete Server: ${error.serverError}`)
    },
  })

  return (
    <Accordion type='single' collapsible className='w-full'>
      {servers.map(item => (
        <AccordionItem value={item.id} key={item.id} className='py-2'>
          <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
            <span className='flex gap-3'>
              <Server
                size={16}
                strokeWidth={2}
                className='mt-1 shrink-0 text-muted-foreground'
                aria-hidden='true'
              />

              <div>
                <span>{item.name}</span>
                <p className='text-sm font-normal text-muted-foreground'>
                  {item.description}
                </p>
              </div>
            </span>
          </AccordionTrigger>

          <AccordionContent className='space-y-4 pb-2 ps-7'>
            <div className='space-y-1'>
              <Label>IP Address</Label>
              <Input disabled value={item.ip} />
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label>Port</Label>
                <Input disabled value={item.port} />
              </div>

              <div className='space-y-1'>
                <Label>Username</Label>
                <Input disabled value={item.username} />
              </div>
            </div>

            {typeof item.sshKey === 'object' && (
              <div className='space-y-1'>
                <Label className='block'>SSH Key</Label>

                <Select disabled value={item.sshKey.id}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a SSH key' />
                  </SelectTrigger>

                  <SelectContent>
                    {sshKeys.map(({ name, id }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='flex w-full justify-end'>
              <Button
                variant='destructive'
                disabled={isPending}
                onClick={() => {
                  execute({ id: item.id })
                }}>
                <Trash2 />
                Delete
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default ServerList
