'use client'

import { CheckIcon, ChevronDownIcon } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export default function SelectSearch({
  info,
  fieldValue,
  label,
  inputPlaceholder,
  gitProviders,
  onSelect,
  disabled = false,
}: {
  info?: any
  fieldValue: string | undefined
  label: string
  inputPlaceholder: string
  gitProviders: any[]
  onSelect: (value: string) => void
  disabled?: boolean
}) {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)

  // Find the selected item to display its name
  const getSelectedItemName = () => {
    if (!fieldValue) return ''

    // For git providers
    if (gitProviders.length > 0 && gitProviders[0]?.github) {
      const provider = gitProviders.find(provider => provider.id === fieldValue)
      return provider?.github?.appName || ''
    }

    // For repositories and branches
    const item = gitProviders.find(item => item.id === fieldValue)
    return item?.name || ''
  }

  return (
    <div className='*:not-first:mt-2'>
      <Label htmlFor={id}>
        {label}
        {info}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={disabled}
            className='mt-2 w-full justify-between border-input bg-transparent px-3 font-normal outline-none outline-offset-0 hover:bg-transparent hover:text-white focus-visible:outline-[3px]'>
            <span
              className={cn(
                'truncate',
                !fieldValue && 'text-muted-foreground',
              )}>
              {fieldValue
                ? getSelectedItemName()
                : inputPlaceholder.includes('fetching')
                  ? inputPlaceholder
                  : `Select ${inputPlaceholder}`}
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
            <CommandInput placeholder={`Search ${inputPlaceholder}...`} />
            <CommandList>
              <CommandEmpty>No {inputPlaceholder} found.</CommandEmpty>
              <CommandGroup>
                {gitProviders.map(item => {
                  // For git providers
                  if (item.github) {
                    return (
                      <CommandItem
                        disabled={!item.github.installationId}
                        key={item.github.appName}
                        value={item.id}
                        onSelect={currentValue => {
                          onSelect(currentValue)
                          setOpen(false)
                        }}>
                        {item.github.appName}
                        {fieldValue === item.id && (
                          <span className='ml-auto text-muted-foreground'>
                            {item.github.installationId && (
                              <CheckIcon size={16} className='stroke-primary' />
                            )}
                          </span>
                        )}
                      </CommandItem>
                    )
                  }

                  // For repositories and branches
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={currentValue => {
                        onSelect(currentValue)
                        setOpen(false)
                      }}>
                      {item.name}
                      {fieldValue === item.id && (
                        <CheckIcon
                          size={16}
                          className='ml-auto stroke-primary'
                        />
                      )}
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
