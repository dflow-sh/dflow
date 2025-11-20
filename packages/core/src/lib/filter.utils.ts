import {
  isAfter,
  startOfMonth,
  startOfQuarter,
  startOfToday,
  startOfWeek,
  startOfYear,
} from 'date-fns'

export type FilterType =
  | 'search'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'date_range'
  | 'number_range'
  | 'status'
  | 'tags'
  | 'nested_array'
  | 'custom'

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'exists'
  | 'not_exists'
  | 'custom'

export interface FilterOption {
  value: any
  label: string
  icon?: React.ComponentType
  color?: string
  count?: number
}

export interface FilterConfig<T = any> {
  key: string
  label: string
  type: FilterType
  options?: FilterOption[]
  searchable?: boolean | string[]
  multiple?: boolean
  nested?: {
    path: string
    key: string
  }
  dateFormat?: boolean
  customExtractor?: (item: T) => any
  category?: string
}

export type FilterState = Record<string, any>

export interface FilterRule {
  field: string
  operator: FilterOperator
  value: any
  type: FilterType
}

export class DynamicFilterEngine<T> {
  private data: T[]
  private schema: FilterConfig<T>[]

  constructor(data: T[], schema: FilterConfig<T>[]) {
    this.data = data
    this.schema = schema
  }

  generateFilterOptions(): FilterConfig<T>[] {
    return this.schema.map(config => {
      if (config.options && config.options.length > 0) {
        return config
      }

      const uniqueValues = this.extractUniqueValues(config)
      const options = uniqueValues.map(value => ({
        value,
        label: this.formatLabel(value),
        count: this.countOccurrences(config, value),
      }))

      return {
        ...config,
        options: options.sort((a, b) => (b.count || 0) - (a.count || 0)),
      }
    })
  }

  private extractUniqueValues(config: FilterConfig<T>): any[] {
    const values = new Set<any>()

    this.data.forEach(item => {
      const value = this.extractValue(item, config)
      if (Array.isArray(value)) {
        value.forEach(v => v !== null && v !== undefined && values.add(v))
      } else if (value !== null && value !== undefined) {
        values.add(value)
      }
    })

    return Array.from(values)
  }

  private extractValue(item: T, config: FilterConfig<T>): any {
    if (config.customExtractor) {
      return config.customExtractor(item)
    }

    if (config.nested) {
      return this.getNestedValue(item, config.nested.path, config.nested.key)
    }

    return this.getObjectValue(item, config.key)
  }

  private getNestedValue(obj: any, path: string, key: string): any {
    const pathValue = this.getObjectValue(obj, path)
    if (!pathValue) return null

    if (Array.isArray(pathValue)) {
      return pathValue
        .map(item => this.getObjectValue(item, key))
        .filter(Boolean)
    }

    if (pathValue.docs && Array.isArray(pathValue.docs)) {
      return pathValue.docs.map((item: any) => this.getObjectValue(item, key))
    }

    return this.getObjectValue(pathValue, key)
  }

  private getObjectValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
  }

  private countOccurrences(config: FilterConfig<T>, value: any): number {
    return this.data.filter(item => {
      const itemValue = this.extractValue(item, config)
      if (Array.isArray(itemValue)) {
        return itemValue.includes(value)
      }
      return itemValue === value
    }).length
  }

  private formatLabel(value: any): string {
    if (typeof value === 'string') {
      return (
        value.charAt(0).toUpperCase() + value.slice(1).replace(/[_-]/g, ' ')
      )
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return String(value)
  }

  applyFilters(filters: FilterState): T[] {
    return this.data.filter(item => {
      return this.schema.every(config => {
        const filterValue = filters[config.key]
        if (
          !filterValue ||
          (Array.isArray(filterValue) && filterValue.length === 0)
        ) {
          return true
        }
        return this.evaluateFilter(item, config, filterValue)
      })
    })
  }

  private evaluateFilter(
    item: T,
    config: FilterConfig<T>,
    filterValue: any,
  ): boolean {
    const itemValue = this.extractValue(item, config)

    switch (config.type) {
      case 'search':
        return this.evaluateSearchFilter(itemValue, filterValue, item, config)
      case 'select':
        return this.evaluateEqualsFilter(itemValue, filterValue)
      case 'multiselect':
        return this.evaluateMultiSelectFilter(itemValue, filterValue)
      case 'boolean':
        return this.evaluateBooleanFilter(itemValue, filterValue)
      case 'date_range':
        return this.evaluateDateRangeFilter(itemValue, filterValue)
      case 'status':
        return this.evaluateStatusFilter(itemValue, filterValue)
      case 'tags':
      case 'nested_array':
        return this.evaluateArrayFilter(itemValue, filterValue)
      case 'number_range':
        return this.evaluateNumberRangeFilter(itemValue, filterValue)
      case 'custom':
        return config.customExtractor ? config.customExtractor(item) : true
      default:
        return this.evaluateEqualsFilter(itemValue, filterValue)
    }
  }

  private evaluateSearchFilter(
    itemValue: any,
    filterValue: string,
    item: T,
    config: FilterConfig<T>,
  ): boolean {
    const searchTerm = filterValue.toLowerCase()
    if (config.searchable) {
      const searchFields = Array.isArray(config.searchable)
        ? config.searchable
        : [config.key]
      return searchFields.some(field => {
        const value = this.getObjectValue(item, field)
        return String(value || '')
          .toLowerCase()
          .includes(searchTerm)
      })
    }
    return String(itemValue || '')
      .toLowerCase()
      .includes(searchTerm)
  }

  private evaluateEqualsFilter(itemValue: any, filterValue: any): boolean {
    return filterValue === 'all' ? true : itemValue === filterValue
  }

  private evaluateMultiSelectFilter(
    itemValue: any,
    filterValue: any[],
  ): boolean {
    if (!Array.isArray(filterValue) || filterValue.length === 0) return true
    if (Array.isArray(itemValue)) {
      return itemValue.some(value => filterValue.includes(value))
    }
    return filterValue.includes(itemValue)
  }

  private evaluateBooleanFilter(
    itemValue: any,
    filterValue: string[],
  ): boolean {
    if (!Array.isArray(filterValue) || filterValue.length === 0) return true
    if (filterValue.includes('true') && filterValue.includes('false'))
      return true
    const isTrue = Boolean(itemValue)
    return filterValue.includes(String(isTrue))
  }

  private evaluateDateRangeFilter(
    itemValue: any,
    filterValue: string,
  ): boolean {
    if (!itemValue || filterValue === 'all') return true
    const date = new Date(itemValue)
    const now = new Date()
    let boundary: Date | null = null

    switch (filterValue) {
      case 'today':
        boundary = startOfToday()
        break
      case 'week':
        boundary = startOfWeek(now)
        break
      case 'month':
        boundary = startOfMonth(now)
        break
      case 'quarter':
        boundary = startOfQuarter(now)
        break
      case 'year':
        boundary = startOfYear(now)
        break
      default:
        return true
    }

    return boundary
      ? isAfter(date, boundary) || date.getTime() === boundary.getTime()
      : true
  }

  private evaluateStatusFilter(itemValue: any, filterValue: string[]): boolean {
    if (!Array.isArray(filterValue) || filterValue.length === 0) return true
    if (Array.isArray(itemValue)) {
      return itemValue.some(status => filterValue.includes(status))
    }
    return filterValue.includes(itemValue)
  }

  private evaluateArrayFilter(itemValue: any, filterValue: string[]): boolean {
    if (!Array.isArray(filterValue) || filterValue.length === 0) return true
    if (filterValue.includes('with-items') && filterValue.includes('empty'))
      return true
    const hasItems = Array.isArray(itemValue) && itemValue.length > 0
    if (filterValue.includes('with-items') && !hasItems) return false
    if (filterValue.includes('empty') && hasItems) return false
    if (Array.isArray(itemValue)) {
      return itemValue.some(value => filterValue.includes(value))
    }
    return false
  }

  private evaluateNumberRangeFilter(
    itemValue: any,
    filterValue: { min?: number; max?: number },
  ): boolean {
    if (
      !filterValue ||
      (filterValue.min === undefined && filterValue.max === undefined)
    ) {
      return true
    }

    const numValue = Number(itemValue)
    if (isNaN(numValue)) return false

    if (filterValue.min !== undefined && numValue < filterValue.min)
      return false
    if (filterValue.max !== undefined && numValue > filterValue.max)
      return false

    return true
  }

  getActiveFilterCount(filters: FilterState): number {
    return this.schema.reduce((count, config) => {
      const filterValue = filters[config.key]
      if (!filterValue) return count

      if (
        typeof filterValue === 'string' &&
        filterValue !== '' &&
        filterValue !== 'all'
      ) {
        return count + 1
      }

      if (Array.isArray(filterValue) && filterValue.length > 0) {
        return count + filterValue.length
      }

      if (
        typeof filterValue === 'object' &&
        Object.keys(filterValue).length > 0
      ) {
        return count + 1
      }

      return count
    }, 0)
  }

  getActiveFilters(filters: FilterState): Array<{
    key: string
    label: string
    value: any
    displayValue: string
  }> {
    const active: Array<{
      key: string
      label: string
      value: any
      displayValue: string
    }> = []

    this.schema.forEach(config => {
      const filterValue = filters[config.key]
      if (!filterValue) return

      if (
        typeof filterValue === 'string' &&
        filterValue !== '' &&
        filterValue !== 'all'
      ) {
        const option = config.options?.find(opt => opt.value === filterValue)
        active.push({
          key: config.key,
          label: config.label,
          value: filterValue,
          displayValue: option?.label || filterValue,
        })
      }

      if (Array.isArray(filterValue) && filterValue.length > 0) {
        filterValue.forEach(value => {
          const option = config.options?.find(opt => opt.value === value)
          active.push({
            key: config.key,
            label: config.label,
            value,
            displayValue: option?.label || value,
          })
        })
      }
    })

    return active
  }

  clearAllFilters(): FilterState {
    const clearedFilters: FilterState = {}

    this.schema.forEach(config => {
      switch (config.type) {
        case 'search':
          clearedFilters[config.key] = ''
          break
        case 'multiselect':
        case 'boolean':
        case 'status':
        case 'tags':
        case 'nested_array':
          clearedFilters[config.key] = []
          break
        case 'select':
        case 'date_range':
          clearedFilters[config.key] = 'all'
          break
        case 'number_range':
          clearedFilters[config.key] = { min: undefined, max: undefined }
          break
        default:
          clearedFilters[config.key] = null
      }
    })

    return clearedFilters
  }

  removeFilter(filters: FilterState, key: string, value?: any): FilterState {
    const newFilters = { ...filters }
    const config = this.schema.find(c => c.key === key)
    if (!config) return newFilters

    if (value === undefined) {
      switch (config.type) {
        case 'search':
          newFilters[key] = ''
          break
        case 'multiselect':
        case 'boolean':
        case 'status':
        case 'tags':
        case 'nested_array':
          newFilters[key] = []
          break
        case 'select':
        case 'date_range':
          newFilters[key] = 'all'
          break
        default:
          newFilters[key] = null
      }
    } else {
      if (Array.isArray(newFilters[key])) {
        newFilters[key] = (newFilters[key] as any[]).filter(v => v !== value)
      }
    }

    return newFilters
  }
}

export function generateSchemaFromData<T>(
  data: T[],
  customConfigs?: Partial<FilterConfig<T>>[],
): FilterConfig<T>[] {
  if (!data.length) return []
  const sample = data[0]
  const schema: FilterConfig<T>[] = []

  Object.keys(sample as object).forEach(key => {
    const value = (sample as any)[key]
    let config: FilterConfig<T> = {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/[_-]/g, ' '),
      type: 'select',
    }

    if (typeof value === 'string') {
      if (
        key.toLowerCase().includes('search') ||
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('description')
      ) {
        config.type = 'search'
      } else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
        config.type = 'date_range'
      }
    } else if (typeof value === 'boolean') {
      config.type = 'boolean'
    } else if (typeof value === 'number') {
      config.type = 'number_range'
    } else if (Array.isArray(value)) {
      config.type = 'nested_array'
      config.nested = { path: key, key: 'type' }
    } else if (typeof value === 'object' && value !== null) {
      if (value.docs && Array.isArray(value.docs)) {
        config.type = 'nested_array'
        config.nested = { path: key, key: 'type' }
      }
    }

    schema.push(config)
  })

  if (customConfigs) {
    customConfigs.forEach(customConfig => {
      const index = schema.findIndex(config => config.key === customConfig.key)
      if (index !== -1) {
        schema[index] = { ...schema[index], ...customConfig }
      }
    })
  }

  return schema
}
