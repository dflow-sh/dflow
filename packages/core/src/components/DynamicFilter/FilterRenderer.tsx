'use client'

import { Search } from 'lucide-react'
import React from 'react'

import { Badge } from "@core/components/ui/badge"
import { Button } from "@core/components/ui/button"
import { Input } from "@core/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/components/ui/select"
import { FilterConfig } from "@core/lib/filter.utils"

interface FilterRendererProps {
  config: FilterConfig
  value: any
  onChange: (value: any) => void
  className?: string
}

export const FilterRenderer: React.FC<FilterRendererProps> = ({
  config,
  value,
  onChange,
  className = '',
}) => {
  const renderSearchFilter = () => (
    <div className={`space-y-2 ${className}`}>
      <label className='text-sm font-medium'>{config.label}</label>
      <div className='relative'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder={`Search ${config.label.toLowerCase()}...`}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className='pl-9'
        />
      </div>
    </div>
  )

  const renderSelectFilter = () => (
    <div className={`space-y-2 ${className}`}>
      <label className='text-sm font-medium'>{config.label}</label>
      <Select value={value || 'all'} onValueChange={onChange}>
        <SelectTrigger className='h-8'>
          <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All {config.label.toLowerCase()}</SelectItem>
          {config.options?.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className='flex items-center gap-2'>
                {option.icon &&
                  React.createElement(
                    option.icon as React.ComponentType<{ className?: string }>,
                    {
                      className: 'h-3 w-3',
                    },
                  )}
                {option.color && (
                  <div className={`h-2 w-2 rounded-full ${option.color}`} />
                )}
                {option.label}
                {option.count !== undefined && (
                  <Badge variant='secondary' className='ml-auto'>
                    {option.count}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const renderMultiSelectFilter = () => (
    <div className={`space-y-2 ${className}`}>
      <label className='text-sm font-medium'>{config.label}</label>
      <div className='flex flex-wrap gap-1'>
        {config.options?.map(option => (
          <Button
            key={option.value}
            variant={
              Array.isArray(value) && value.includes(option.value)
                ? 'default'
                : 'outline'
            }
            size='sm'
            onClick={() => {
              const currentValues = Array.isArray(value) ? value : []
              const newValues = currentValues.includes(option.value)
                ? currentValues.filter(v => v !== option.value)
                : [...currentValues, option.value]
              onChange(newValues)
            }}
            className='h-7 gap-1.5 text-xs'>
            {option.icon &&
              React.createElement(
                option.icon as React.ComponentType<{ className?: string }>,
                {
                  className: 'h-3 w-3',
                },
              )}
            {option.color && (
              <div className={`h-2 w-2 rounded-full ${option.color}`} />
            )}
            {option.label}
            {option.count !== undefined && (
              <Badge variant='secondary' className='ml-1'>
                {option.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  )

  const renderBooleanFilter = () => (
    <div className={`space-y-2 ${className}`}>
      <label className='text-sm font-medium'>{config.label}</label>
      <div className='flex gap-1'>
        {[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
        ].map(option => (
          <Button
            key={option.value}
            variant={
              Array.isArray(value) && value.includes(option.value)
                ? 'default'
                : 'outline'
            }
            size='sm'
            onClick={() => {
              const currentValues = Array.isArray(value) ? value : []
              const newValues = currentValues.includes(option.value)
                ? currentValues.filter(v => v !== option.value)
                : [...currentValues, option.value]
              onChange(newValues)
            }}
            className='h-7 gap-1.5 text-xs'>
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )

  const renderDateRangeFilter = () => (
    <div className={`space-y-2 ${className}`}>
      <label className='text-sm font-medium'>{config.label}</label>
      <Select value={value || 'all'} onValueChange={onChange}>
        <SelectTrigger className='h-8'>
          <SelectValue placeholder='Any time' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Any time</SelectItem>
          <SelectItem value='today'>Today</SelectItem>
          <SelectItem value='week'>This Week</SelectItem>
          <SelectItem value='month'>This Month</SelectItem>
          <SelectItem value='quarter'>This Quarter</SelectItem>
          <SelectItem value='year'>This Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  const renderNumberRangeFilter = () => (
    <div className={`space-y-2 ${className}`}>
      <label className='text-sm font-medium'>{config.label}</label>
      <div className='flex gap-2'>
        <Input
          type='number'
          placeholder='Min'
          value={value?.min || ''}
          onChange={e =>
            onChange({
              ...value,
              min: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className='h-8'
        />
        <Input
          type='number'
          placeholder='Max'
          value={value?.max || ''}
          onChange={e =>
            onChange({
              ...value,
              max: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className='h-8'
        />
      </div>
    </div>
  )

  const renderArrayFilter = () => renderMultiSelectFilter()

  switch (config.type) {
    case 'search':
      return renderSearchFilter()
    case 'select':
      return renderSelectFilter()
    case 'multiselect':
      return renderMultiSelectFilter()
    case 'boolean':
      return renderBooleanFilter()
    case 'date_range':
      return renderDateRangeFilter()
    case 'number_range':
      return renderNumberRangeFilter()
    case 'status':
      return renderMultiSelectFilter()
    case 'tags':
    case 'nested_array':
      return renderArrayFilter()
    default:
      return renderSelectFilter()
  }
}
