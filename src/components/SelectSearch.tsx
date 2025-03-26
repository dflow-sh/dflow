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
import { Project } from '@/payload-types'

export default function SelectSearch({
  projects,
  placeholder,
}: {
  projects: Project[]
  placeholder: string
}) {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')

  return (
    <div className='*:not-first:mt-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={'ghost'}
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between border-input bg-background px-1 font-normal outline-none outline-offset-0 hover:bg-accent-foreground focus-visible:outline-[3px]'>
            <ChevronsUpDown
              size={14}
              className='shrink-0 text-muted-foreground/80'
              aria-hidden='true'
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0'
          align='start'>
          <Command>
            <CommandInput placeholder={`Search ${placeholder}...`} />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {projects.map(project => (
                  <Link
                    href={`/dashboard/project/${project.id}`}
                    key={project.id}>
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={currentValue => {
                        setValue(currentValue === value ? '' : currentValue)
                        setOpen(false)
                      }}>
                      {project.name}
                      {value === project.name && (
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
    </div>
  )
}
