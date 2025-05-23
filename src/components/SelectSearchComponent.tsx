'use client'

import {
  CheckIcon,
  ChevronDownIcon,
  HardDrive,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { JSX, SVGProps, useEffect, useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { supportedLinuxVersions } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

import { Dokku, Linux, Ubuntu } from './icons'
import { useDokkuInstallationStep } from './onboarding/dokkuInstallation/DokkuInstallationStepContext'
import { Separator } from './ui/separator'

const serverType: {
  [key: string]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  Ubuntu: Ubuntu,
}

export default function SelectSearchComponent({
  label,
  buttonLabel,
  commandInputLabel,
  servers,
  commandEmpty,
}: {
  label?: string
  buttonLabel: string
  commandInputLabel: string
  servers: ServerType[]
  commandEmpty: string
}) {
  const [open, setOpen] = useState<boolean>(false)
  const [server, setServer] = useQueryState('server')
  const [selectedServer, setSelectedServer] = useState(server)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const { setDokkuInstallationStep } = useDokkuInstallationStep()

  // Check if server is eligible for auto-selection
  const isServerEligible = (serverDetails: ServerType) => {
    return (
      serverDetails.portIsOpen &&
      serverDetails.sshConnected &&
      supportedLinuxVersions.includes(serverDetails.os.version ?? '')
    )
  }

  useEffect(() => {
    // Case 1: Server ID is present in URL query
    if (server) {
      const foundServer = servers.find(
        serverDetails => serverDetails.id === server,
      )

      if (foundServer && isServerEligible(foundServer)) {
        setServer(server, {
          shallow: false,
        })

        setDokkuInstallationStep(2)
      }
    }

    // Case 2: Only one server is available and it's eligible
    // else if (servers.length === 1 && isServerEligible(servers[0])) {
    //   const singleServer = servers[0]
    //   setSelectedServer(singleServer.id)
    //   setServer(singleServer.id, {
    //     shallow: false,
    //   })
    //   setDokkuInstallationStep(2)
    // }
  }, [])

  const handleSelect = (serverId: string) => {
    setSelectedServer(serverId)
    setOpen(false)
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className='*:not-first:mt-2'>
      <Label htmlFor={'server-select'} className='mb-2 ml-1.5 block'>
        {label}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <div className='flex items-center gap-x-2'>
          <PopoverTrigger asChild>
            <Button
              id={'server-select'}
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='w-full bg-transparent hover:bg-transparent hover:text-foreground'>
              <div className='flex w-full items-center justify-between'>
                <span>
                  {selectedServer
                    ? servers.find(s => s.id === selectedServer)?.name
                    : `${buttonLabel}`}
                </span>

                <ChevronDownIcon
                  size={16}
                  className='shrink-0 text-muted-foreground/80'
                  aria-hidden='true'
                />
              </div>
            </Button>
          </PopoverTrigger>

          <Button variant={'secondary'} onClick={handleRefresh}>
            <RefreshCw
              className={`stroke-muted-foreground ${isPending && 'animate-spin'}`}
            />
          </Button>
        </div>

        <PopoverContent
          className='w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0'
          align='start'>
          <Command>
            <CommandInput placeholder={commandInputLabel} />
            <CommandList>
              <CommandEmpty>{commandEmpty}</CommandEmpty>
              <CommandGroup>
                {servers.map(serverDetails => {
                  const { sshConnected, os, id, name } = serverDetails
                  const isSSHConnected = sshConnected
                  const supportedOS = supportedLinuxVersions.includes(
                    os.version ?? '',
                  )
                  const ServerTypeIcon = serverType[os.type ?? ''] ?? Linux

                  const dokkuInstalled =
                    sshConnected &&
                    supportedLinuxVersions.includes(os.version ?? '') &&
                    os.version

                  return (
                    <CommandItem
                      key={id}
                      value={name}
                      onSelect={() => handleSelect(id)}
                      disabled={!isSSHConnected || !supportedOS}
                      className='cursor-pointer'>
                      <HardDrive size={16} />
                      {name}
                      <div className='ml-auto flex items-center gap-3'>
                        {os.version ? (
                          <>
                            <ServerTypeIcon fontSize={16} />
                            <span className='text-xs'>{os.version}</span>
                          </>
                        ) : (
                          <div className='text-xs'>
                            <TriangleAlert
                              size={16}
                              className='mr-1 inline-block'
                            />
                            <span>Not supported</span>
                          </div>
                        )}

                        {os.version && dokkuInstalled && (
                          <>
                            <Separator
                              orientation='vertical'
                              className='h-4 bg-gray-500'
                            />

                            <Dokku height={20} width={20} />
                            <span className='text-xs'>
                              {serverDetails.version || 'not-installed'}
                            </span>
                          </>
                        )}

                        {server === id && <CheckIcon size={16} />}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        className='mt-2'
        disabled={!selectedServer}
        onClick={() => {
          if (selectedServer) {
            setServer(selectedServer)
            setDokkuInstallationStep(2)
          }
        }}>
        Select Server
      </Button>
    </div>
  )
}
