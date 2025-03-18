'use client'

import {
  CheckIcon,
  ChevronDownIcon,
  HardDrive,
  TriangleAlert,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { JSX, SVGProps, useId, useState } from 'react'

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
import { cn } from '@/lib/utils'
import { ServerType } from '@/payload-types-overrides'

import { Dokku, Linux, Ubuntu } from './icons'
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
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedServerId = searchParams.get('server') || ''

  const handleSelect = (serverId: string) => {
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('server', serverId)
    router.replace(newUrl.toString(), { scroll: false }) // Updates the URL without page refresh
    setOpen(false)
  }

  return (
    <div className='*:not-first:mt-2'>
      <Label htmlFor={id} className='mb-2 ml-1.5 block'>
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background hover:text-white focus-visible:outline-[3px]'>
            <span className={cn('truncate', !value && 'text-muted-foreground')}>
              {selectedServerId
                ? servers.find(s => s.id === selectedServerId)?.name
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
                {servers.map(framework => {
                  const isSSHConnected = framework.sshConnected
                  const supportedOS = supportedLinuxVersions.includes(
                    framework.os.version ?? '',
                  )
                  const ServerTypeIcon =
                    serverType[framework.os.type ?? ''] ?? Linux

                  const dokkuInstalled =
                    framework.sshConnected &&
                    supportedLinuxVersions.includes(
                      framework.os.version ?? '',
                    ) &&
                    framework.version

                  // console.log(
                  //   `${framework.name} dokku not installed: `,
                  //   dokkuInstalled,
                  // )

                  return (
                    <CommandItem
                      key={framework.id}
                      value={framework.name}
                      onSelect={() => handleSelect(framework.id)}
                      disabled={!isSSHConnected || !supportedOS}
                      className='cursor-pointer'>
                      <HardDrive size={16} />
                      {framework.name}
                      <div className='ml-auto flex items-center gap-3'>
                        {framework.os.version ? (
                          <>
                            <ServerTypeIcon fontSize={16} />
                            <span className='text-xs'>
                              {framework.os.version}
                            </span>
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
                        {framework.os.version && dokkuInstalled && (
                          <Separator
                            orientation='vertical'
                            className='h-4 bg-gray-500'
                          />
                        )}
                        {dokkuInstalled ? (
                          <>
                            <Dokku height={20} width={20} />
                            <span className='text-xs'>{framework.version}</span>
                          </>
                        ) : (
                          <span></span>
                        )}
                        {value === framework.name && <CheckIcon size={16} />}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
