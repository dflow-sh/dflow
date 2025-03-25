'use client'

import { Dokku, Linux, Ubuntu } from '../icons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { HardDrive, Trash2, TriangleAlert } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { JSX, SVGProps } from 'react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { supportedLinuxVersions } from '@/lib/constants'
import { SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import UpdateServer from './CreateServerForm'

const serverType: {
  [key: string]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  Ubuntu: Ubuntu,
}

const ServerStatus = ({ server }: { server: ServerType }) => {
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
    <div className='flex items-center gap-6 font-normal'>
      {os.version && (
        <div role='status' className='flex items-center gap-1.5 text-[0.75rem]'>
          <ServerTypeIcon className='size-5' />
          <span>{os.version}</span>
        </div>
      )}

      <div className='flex items-center gap-1.5 text-[0.75rem]'>
        <Dokku />
        <span>
          {server.version && server.version === 'not-installed'
            ? 'not-installed'
            : `v${server.version}`}
        </span>
      </div>
    </div>
  )
}

const ServerItem = ({
  server,
  sshKeys,
}: {
  server: ServerType
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
    <AccordionItem value={server.id} className='border-b-0 py-2'>
      <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
        <div className='flex w-full items-center justify-between pr-2'>
          <div className='flex gap-3'>
            <HardDrive
              size={16}
              className='mt-1 shrink-0 text-muted-foreground'
              aria-hidden='true'
            />

            <div>
              <div className='space-x-2'>
                <span>{server.name}</span>
              </div>

              <p className='text-sm font-normal text-muted-foreground'>
                {server.description}
              </p>
            </div>
          </div>

          <ServerStatus server={server} />
        </div>
      </AccordionTrigger>

      <AccordionContent className='space-y-4 pb-2 ps-7'>
        <div className='space-y-1'>
          <Label>IP Address</Label>
          <Input disabled value={server.ip} />
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <div className='space-y-1'>
            <Label>Port</Label>
            <Input disabled value={server.port} />
          </div>

          <div className='space-y-1'>
            <Label>Username</Label>
            <Input disabled value={server.username} />
          </div>
        </div>

        {typeof server.sshKey === 'object' && (
          <div className='space-y-1'>
            <Label className='block'>SSH Key</Label>

            <Select disabled value={server.sshKey.id}>
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

        <div className='flex w-full justify-end gap-3'>
          <UpdateServer
            sshKeys={sshKeys}
            type='update'
            title='Update Server'
            server={server}
          />

          <Button
            variant='destructive'
            disabled={isPending}
            onClick={() => {
              execute({ id: server.id })
            }}>
            <Trash2 />
            Delete
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

const ServerList = ({
  servers,
  sshKeys,
}: {
  servers: ServerType[]
  sshKeys: SshKey[]
}) => {
  return (
    <Accordion type='single' collapsible className='w-full divide-y-[1px]'>
      {servers.map(serverDetails => (
        <ServerItem
          server={serverDetails}
          key={serverDetails.id}
          sshKeys={sshKeys}
        />
      ))}
    </Accordion>
  )
}

export default ServerList
