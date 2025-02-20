'use client'

import { Dokku, Linux, Ubuntu } from '../icons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Download, Pencil, Server, Trash2, TriangleAlert } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { JSX, SVGProps } from 'react'
import { toast } from 'sonner'

import { deleteServerAction, installDokkuAction } from '@/actions/server'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { supportedLinuxVersions } from '@/lib/constants'
import { SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'
import { useTerminal } from '@/providers/ServerTerminalProvider'

import CreateServer from './CreateServerForm'

const serverType: {
  [key: string]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  Ubuntu: Ubuntu,
}

const ServerStatus = ({ server }: { server: ServerType }) => {
  const { execute, isPending } = useAction(installDokkuAction)
  const sshKey =
    typeof server.sshKey === 'object' ? server.sshKey.privateKey : null
  const { setOpen } = useTerminal()
  const { os } = server
  const ServerTypeIcon = serverType[os.type ?? ''] ?? Linux

  if (!server.portIsOpen || !server.sshConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role='status'
              className='flex items-center gap-1 rounded-full border border-destructive bg-destructive/10 px-3 py-1 text-[0.75rem] text-destructive'>
              <TriangleAlert size={20} />
              <p>Connection failed</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Failed to connect to server, check the server-details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (server.version === 'not-installed') {
    return (
      <Button
        variant='outline'
        disabled={isPending || !sshKey}
        onClick={e => {
          e.stopPropagation()

          if (sshKey) {
            execute({
              host: server.ip,
              port: server.port,
              privateKey: sshKey,
              username: server.username,
            })
            setOpen(true)
          }
        }}>
        <Download />
        {isPending ? 'Installing...' : 'Install Dokku'}
      </Button>
    )
  }

  if (os.version && !supportedLinuxVersions.includes(os.version)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role='status'
              className='flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.75rem]'>
              <ServerTypeIcon className='size-5' />

              <span>{`${os.version} not supported`}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className='max-w-64'>
            <p>
              {`Dokku doesn't support ${os.type} ${os.version}, check
              dokku docs for supported version`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      {os.version && (
        <div
          role='status'
          className='flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.75rem]'>
          <ServerTypeIcon className='size-5' />

          <span>{os.version}</span>
        </div>
      )}

      <div className='flex items-center gap-1.5 rounded-full border border-cyan-900 bg-cyan-100 px-3 py-1 text-[0.75rem] text-cyan-900'>
        <Dokku />

        <span>{`v${server.version}`}</span>
      </div>
    </div>
  )
}

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
            <div className='flex w-full items-center justify-between pr-2'>
              <div className='flex gap-3'>
                <Server
                  size={16}
                  strokeWidth={2}
                  className='mt-3 shrink-0 text-muted-foreground'
                  aria-hidden='true'
                />

                <div>
                  <div className='space-x-2'>
                    <span>{item.name}</span>
                    <CreateServer
                      sshKeys={sshKeys}
                      type='update'
                      title='Update Server'
                      server={item}
                      description='Update the server-details'>
                      <Button
                        variant='ghost'
                        asChild
                        onClick={e => {
                          e.stopPropagation()
                        }}
                        size='icon'>
                        <div>
                          <Pencil />
                        </div>
                      </Button>
                    </CreateServer>
                  </div>

                  <p className='text-sm font-normal text-muted-foreground'>
                    {item.description}
                  </p>
                </div>
              </div>

              <ServerStatus server={item} />
            </div>
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
