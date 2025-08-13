'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ChevronDown, Filter, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DynamicFilterEngine,
  FilterConfig,
  FilterState,
} from '@/lib/filter.utils'

import { FilterRenderer } from './FilterRenderer'

interface DynamicFilterPanelProps<T> {
  data: T[]
  schema: FilterConfig<T>[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onDataFiltered?: (filteredData: T[]) => void
  className?: string
}

export const DynamicFilterPanel = <T,>({
  data,
  schema,
  filters,
  onFiltersChange,
  onDataFiltered,
  className = '',
}: DynamicFilterPanelProps<T>) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const filterEngine = useMemo(
    () => new DynamicFilterEngine<T>(data, schema),
    [data, schema],
  )

  const enrichedSchema = useMemo(
    () => filterEngine.generateFilterOptions(),
    [filterEngine],
  )

  const filteredData = useMemo(() => {
    const result = filterEngine.applyFilters(filters)
    onDataFiltered?.(result)
    return result
  }, [filterEngine, filters, onDataFiltered])

  const activeFilterCount = useMemo(
    () => filterEngine.getActiveFilterCount(filters),
    [filterEngine, filters],
  )

  const activeFilters = useMemo(
    () => filterEngine.getActiveFilters(filters),
    [filterEngine, filters],
  )

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleClearAllFilters = () => {
    const clearedFilters = filterEngine.clearAllFilters()
    onFiltersChange(clearedFilters)
  }

  const handleRemoveFilter = (key: string, value?: any) => {
    // Find the filter config to determine filter type
    const filterConfig = enrichedSchema.find(config => config.key === key)

    // For text-based filters, clear the entire filter instead of trying to remove a specific value
    if (filterConfig?.type === 'search') {
      const newFilters = { ...filters }
      delete newFilters[key]
      onFiltersChange(newFilters)
    } else {
      // For other filter types (multi-select, etc.), use the existing logic
      const newFilters = filterEngine.removeFilter(filters, key, value)
      onFiltersChange(newFilters)
    }
  }

  const groupedSchema = useMemo(() => {
    const groups: { [key: string]: FilterConfig<T>[] } = { main: [] }

    enrichedSchema.forEach(config => {
      const category = config.category || 'main'
      if (!groups[category]) groups[category] = []
      groups[category].push(config)
    })

    return groups
  }, [enrichedSchema])

  return (
    <div className={`space-y-4 ${className}`}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <Filter className='h-4 w-4' />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs'>
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className='h-3 w-3' />
              </Button>
            </PopoverTrigger>

            <PopoverContent className='w-96 p-0' align='start'>
              <div className='flex items-center justify-between border-b p-4'>
                <h4 className='font-medium'>Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleClearAllFilters}
                    className='h-6 px-2 text-xs'>
                    Clear all
                  </Button>
                )}
              </div>

              <ScrollArea className='h-[500px]'>
                <div className='space-y-4 p-4'>
                  {Object.entries(groupedSchema).map(
                    ([category, configs], groupIndex) => (
                      <div key={category}>
                        {category !== 'main' && (
                          <div className='mb-3'>
                            <h5 className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>
                              {category}
                            </h5>
                          </div>
                        )}

                        {configs.map((config, index) => (
                          <div key={config.key}>
                            <FilterRenderer
                              config={config as FilterConfig}
                              value={filters[config.key]}
                              onChange={value =>
                                handleFilterChange(config.key, value)
                              }
                              className='mb-3'
                            />
                            {index < configs.length - 1 && (
                              <Separator className='my-3' />
                            )}
                          </div>
                        ))}

                        {groupIndex <
                          Object.entries(groupedSchema).length - 1 && (
                          <Separator className='my-4' />
                        )}
                      </div>
                    ),
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <span className='text-sm text-muted-foreground'>
            {filteredData.length} of {data.length} items
          </span>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className='flex flex-wrap gap-2'>
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.key}-${filter.value}-${index}`}
              variant='secondary'
              className='gap-1'>
              {filter.displayValue}
              <button
                type='button'
                title='remove'
                onClick={() => handleRemoveFilter(filter.key, filter.value)}
                className='ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20'>
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
