'use client'

import { Dokku, Linux, Ubuntu } from '../icons'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { HardDrive, Trash2, TriangleAlert } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { JSX, SVGProps } from 'react'
import { toast } from 'sonner'

import { deleteServerAction } from '@/actions/server'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { supportedLinuxVersions } from '@/lib/constants'
import { SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import ServerFormDialog from './ServerFormDialog'

const serverType: {
  [key: string]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  Ubuntu: Ubuntu,
}

const ServerStatus = ({ server }: { server: ServerType }) => {
  const { os } = server
  const ServerTypeIcon = serverType[os.type ?? ''] ?? Linux

  if (!server.portIsOpen || !Boolean(server.connection?.status === 'success')) {
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
    <Card className='max-w-5xl'>
      <CardContent className='flex w-full items-center justify-between gap-3 pt-4'>
        <div className='flex items-center gap-3'>
          <HardDrive size={20} />

          <div>
            <p className='font-semibold'>{server.name}</p>
            <span className='text-sm text-muted-foreground'>
              {server.description}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <ServerStatus server={server} />

          <ServerFormDialog
            sshKeys={sshKeys}
            formType='update'
            title='Update Server'
            server={server}
          />

          <Button
            disabled={isPending}
            onClick={() => {
              // execute({ id: server.id, })
            }}
            size='icon'
            variant='outline'>
            <Trash2 size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const ServerList = ({
  servers,
  sshKeys,
}: {
  servers: ServerType[]
  sshKeys: SshKey[]
}) => {
  return servers.map(server => (
    <ServerItem server={server} sshKeys={sshKeys} key={server.id} />
  ))
}

export default ServerList
