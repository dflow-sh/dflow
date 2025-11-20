'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  DynamicFilterEngine,
  FilterConfig,
  FilterState,
  generateSchemaFromData,
} from '@dflow/shared/filter.utils'

interface UseDynamicFilterProps<T> {
  data: T[]
  schema?: FilterConfig<T>[]
  autoGenerateSchema?: boolean
  customConfigs?: Partial<FilterConfig<T>>[]
  initialFilters?: FilterState
}

export const useDynamicFilter = <T>({
  data,
  schema,
  autoGenerateSchema = true,
  customConfigs,
  initialFilters = {},
}: UseDynamicFilterProps<T>) => {
  const filterSchema = useMemo(() => {
    if (schema) return schema
    if (autoGenerateSchema)
      return generateSchemaFromData<T>(data, customConfigs)
    return []
  }, [data, schema, autoGenerateSchema, customConfigs])

  const [filters, setFilters] = useState<FilterState>(() => {
    const engine = new DynamicFilterEngine<T>(data, filterSchema)
    return { ...engine.clearAllFilters(), ...initialFilters }
  })

  const filterEngine = useMemo(
    () => new DynamicFilterEngine<T>(data, filterSchema),
    [data, filterSchema],
  )

  const filteredData = useMemo(
    () => filterEngine.applyFilters(filters),
    [filterEngine, filters],
  )

  const enrichedSchema = useMemo(
    () => filterEngine.generateFilterOptions(),
    [filterEngine],
  )

  const activeFilterCount = useMemo(
    () => filterEngine.getActiveFilterCount(filters),
    [filterEngine, filters],
  )

  const activeFilters = useMemo(
    () => filterEngine.getActiveFilters(filters),
    [filterEngine, filters],
  )

  const clearAllFilters = useCallback(() => {
    const clearedFilters = filterEngine.clearAllFilters()
    setFilters(clearedFilters)
  }, [filterEngine])

  const removeFilter = useCallback(
    (key: string, value?: any) => {
      const newFilters = filterEngine.removeFilter(filters, key, value)
      setFilters(newFilters)
    },
    [filterEngine, filters],
  )

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    filteredData,
    filters,
    setFilters,
    schema: enrichedSchema,
    activeFilterCount,
    activeFilters,
    clearAllFilters,
    removeFilter,
    updateFilter,
    filterEngine,
  }
}
