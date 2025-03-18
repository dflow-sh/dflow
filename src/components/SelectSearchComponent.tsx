'use client'

import {
  CheckIcon,
  ChevronDownIcon,
  HardDrive,
  TriangleAlert,
} from 'lucide-react'
import { useQueryState } from 'nuqs'
import { JSX, SVGProps, useState } from 'react'

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
import { useInstallationStep } from './onboarding/dokkuInstallation/InstallationStepContext'
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
  label: string
  buttonLabel: string
  commandInputLabel: string
  servers: ServerType[]
  commandEmpty: string
}) {
  const [open, setOpen] = useState<boolean>(false)
  const [server, setServer] = useQueryState('server')
  const { setStep } = useInstallationStep()

  const handleSelect = (serverId: string) => {
    setServer(serverId)
    setOpen(false)
  }

  return (
    <div className='*:not-first:mt-2'>
      <Label htmlFor={'server-select'} className='mb-2 ml-1.5 block'>
        {label}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={'server-select'}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background hover:text-white focus-visible:outline-[3px]'>
            <span>
              {server
                ? servers.find(s => s.id === server)?.name
                : `${buttonLabel}`}
            </span>
            <ChevronDownIcon
              size={16}
              className='shrink-0 text-muted-foreground/80'
              aria-hidden='true'
            />
          </Button>
        </PopoverTrigger>

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
                            <span className='text-xs'>{os.version}</span>
                          </>
                        )}

                        {server === name && <CheckIcon size={16} />}
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
        disabled={!server}
        onClick={() => {
          if (server) {
            setStep(2)
          }
        }}>
        Select Server
      </Button>
    </div>
  )
}
