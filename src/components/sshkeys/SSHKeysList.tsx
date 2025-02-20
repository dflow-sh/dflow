'use client'

import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { KeyRound, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { deleteSSHKeyAction } from '@/actions/sshkeys'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SshKey } from '@/payload-types'

// import UpdateSSHKeyForm from './CreateSSHKeyForm'

const SSHKeysList = ({ keys }: { keys: SshKey[] }) => {
  const { execute, isPending } = useAction(deleteSSHKeyAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Successfully deleted SSH key`)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete SSH key: ${error.serverError}`)
    },
  })

  return (
    <Accordion type='single' collapsible className='w-full'>
      {keys.map(item => (
        <AccordionItem value={item.id} key={item.id} className='py-2'>
          <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
            <span className='flex gap-3'>
              <KeyRound
                size={16}
                strokeWidth={2}
                className='mt-3 shrink-0 text-muted-foreground'
                aria-hidden='true'
              />

              <div>
                <div className='space-x-2'>
                  <span>{item.name}</span>
                  {/* <UpdateSSHKeyForm
                    sshKey={item}
                    title='Update SSH Key'
                    description='This form updates SSH key'>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={e => {
                        e.stopPropagation()
                      }}>
                      <Pencil />
                    </Button>
                  </UpdateSSHKeyForm> */}
                </div>
                <p className='text-sm font-normal text-muted-foreground'>
                  {item.description}
                </p>
              </div>
            </span>
          </AccordionTrigger>

          <AccordionContent className='space-y-4 pb-2 ps-7'>
            <div className='space-y-1'>
              <Label>Public Key</Label>
              <Textarea disabled value={item.publicKey} />
            </div>

            <div className='space-y-1'>
              <Label>Private Key</Label>
              <Textarea disabled value={item.privateKey} />
            </div>

            <Button
              variant='destructive'
              disabled={isPending}
              onClick={() => {
                execute({ id: item.id })
              }}>
              <Trash2 />
              Delete
            </Button>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default SSHKeysList
