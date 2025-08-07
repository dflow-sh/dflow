'use client'

import { Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DefaultTimeRangeSelectorProps {
  currentType: '1m' | '10m' | '20m' | '120m' | '480m'
  onTimeRangeChange: (type: string, from: string) => void
}

const DefaultTimeRangeSelector = ({
  currentType,
  onTimeRangeChange,
}: DefaultTimeRangeSelectorProps) => {
  const timeRangeOptions = [
    { value: '1m', label: 'Last 1 Hour (1m intervals)', hours: 1 },
    { value: '10m', label: 'Last 4 Hours (10m intervals)', hours: 4 },
    { value: '20m', label: 'Last 8 Hours (20m intervals)', hours: 8 },
    { value: '120m', label: 'Last 2 Days (2h intervals)', hours: 48 },
    { value: '480m', label: 'Last 7 Days (8h intervals)', hours: 168 },
  ]

  const getCurrentLabel = () => {
    const option = timeRangeOptions.find(opt => opt.value === currentType)
    return option?.label || 'Select Range'
  }

  const handleRangeChange = (value: string) => {
    const option = timeRangeOptions.find(opt => opt.value === value)
    if (option) {
      const fromTime = new Date(
        Date.now() - option.hours * 60 * 60 * 1000,
      ).toISOString()
      onTimeRangeChange(value, fromTime)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='min-w-[180px] justify-start'>
          <Clock className='mr-2 h-4 w-4' />
          <span className='truncate'>{getCurrentLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[220px]'>
        {timeRangeOptions.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleRangeChange(option.value)}
            className={currentType === option.value ? 'bg-accent' : ''}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DefaultTimeRangeSelector
