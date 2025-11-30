'use client'

import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Server, Service } from '@/payload-types'

export default function SelectSearch({
  services,
  projects,
  placeholder,
  projectId = '',
  servers,
  serverId = '',
  serviceId = '',
  organisationSlug,
}: {
  services?: Service[]
  projects?: { id: string; name: string }[]
  placeholder: string
  projectId?: string
  servers?: Server[]
  serverId?: string
  serviceId?: string
  organisationSlug: string
}) {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>(
    projectId || serverId || serviceId || '',
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={'ghost'}
          role='combobox'
          className='px-1.5'
          aria-expanded={open}>
          <ChevronsUpDown
            size={14}
            className='text-muted-foreground/80 shrink-0'
            aria-hidden='true'
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='border-input w-full min-w-(--radix-popper-anchor-width) p-0'
        align='start'>
        <Command>
          <CommandInput placeholder={`Search ${placeholder}...`} />
          <CommandList>
            <CommandEmpty>No {placeholder} found.</CommandEmpty>
            <CommandGroup>
              {projects?.map(project => (
                <Link
                  href={`/${organisationSlug}/dashboard/project/${project.id}`}
                  key={project.id}>
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={currentValue => {
                      setValue(currentValue === value ? '' : currentValue)
                      setOpen(false)
                    }}>
                    {project.name}

                    {value === project.id && (
                      <CheckIcon size={16} className='ml-auto' />
                    )}
                  </CommandItem>
                </Link>
              ))}

              {services?.map(service => (
                <Link
                  href={`/${organisationSlug}/dashboard/project/${projectId}/service/${service.id}`}
                  key={service.id}>
                  <CommandItem
                    key={service.id}
                    value={service.id}
                    onSelect={currentValue => {
                      setValue(() => {
                        return currentValue === value ? '' : currentValue
                      })
                      setOpen(false)
                    }}>
                    {service.name}

                    {value === service.id && (
                      <CheckIcon size={16} className='ml-auto' />
                    )}
                  </CommandItem>
                </Link>
              ))}

              {servers?.map(server => (
                <Link
                  href={`/${organisationSlug}/servers/${server.id}`}
                  key={server.id}>
                  <CommandItem
                    key={server.id}
                    value={server.name}
                    onSelect={currentValue => {
                      setValue(() => {
                        return currentValue === value ? '' : currentValue
                      })
                      setOpen(false)
                    }}>
                    {server.name}
                    {value === server.id && (
                      <CheckIcon size={16} className='ml-auto' />
                    )}
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
