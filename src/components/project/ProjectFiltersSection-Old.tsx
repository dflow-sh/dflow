'use client'

import { Docker } from '../icons'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Separator } from '../ui/separator'
import {
  isAfter,
  startOfMonth,
  startOfQuarter,
  startOfToday,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Code,
  Database,
  Filter,
  Globe,
  Pause,
  Play,
  Search,
  Server,
  Settings,
  X,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { ProjectCard } from '@/components/ProjectCard'
import { Project, Service } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

interface ProjectFiltersProps {
  projects: Project[]
  hiddenProjects: Project[]
  servers: ServerType[]
  organisationSlug: string
}

interface FilterOptions {
  search: string
  status: string[]
  serviceType: string[]
  server: string
  dateRange: string
  visibility: string[]
  builder: string[]
  provider: string[]
  hasServices: string[]
}

const ProjectFiltersSection = ({
  projects,
  hiddenProjects,
  servers,
  organisationSlug,
}: ProjectFiltersProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: [],
    serviceType: [],
    server: 'all',
    dateRange: 'all',
    visibility: [],
    builder: [],
    provider: [],
    hasServices: [],
  })

  // Combine all projects for filtering
  const allProjects = useMemo(
    () => [...projects, ...hiddenProjects],
    [projects, hiddenProjects],
  )

  // Filter options configuration
  const filterConfig = {
    status: [
      { value: 'running', label: 'Running', icon: Play, color: 'bg-green-500' },
      { value: 'stopped', label: 'Stopped', icon: Pause, color: 'bg-red-500' },
      {
        value: 'missing',
        label: 'Missing',
        icon: AlertCircle,
        color: 'bg-orange-500',
      },
      { value: 'exited', label: 'Exited', icon: Clock, color: 'bg-gray-500' },
      {
        value: 'healthy',
        label: 'Healthy',
        icon: CheckCircle,
        color: 'bg-green-500',
      },
    ],
    serviceType: [
      { value: 'app', label: 'Application', icon: Globe },
      { value: 'database', label: 'Database', icon: Database },
      { value: 'docker', label: 'Docker', icon: Docker },
    ],
    builder: [
      { value: 'buildPacks', label: 'Build Packs', icon: Settings },
      { value: 'railpack', label: 'Railpack', icon: Code },
      { value: 'nixpacks', label: 'Nixpacks', icon: Zap },
      { value: 'dockerfile', label: 'Dockerfile', icon: Docker },
      {
        value: 'herokuBuildPacks',
        label: 'Heroku Build Packs',
        icon: Settings,
      },
    ],
    provider: [
      { value: 'digitalocean', label: 'DigitalOcean', icon: Server },
      { value: 'aws', label: 'AWS', icon: Server },
      { value: 'gcp', label: 'Google Cloud', icon: Server },
      { value: 'azure', label: 'Azure', icon: Server },
      { value: 'dflow', label: 'dFlow', icon: Server },
      { value: 'other', label: 'Other', icon: Server },
    ],
    // visibility: [
    //   { value: 'visible', label: 'Visible', icon: Eye },
    //   { value: 'hidden', label: 'Hidden', icon: EyeOff },
    // ],
    hasServices: [
      { value: 'with-services', label: 'Has Services', icon: CheckCircle },
      { value: 'empty', label: 'No Services', icon: AlertCircle },
    ],
    dateRange: [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'quarter', label: 'This Quarter' },
      { value: 'year', label: 'This Year' },
    ],
  }

  // Helper function to get server from project
  const getProjectServer = (project: Project) => {
    return typeof project.server === 'string'
      ? project.server
      : project.server?.id
  }

  // Helper function to get project services
  const getProjectServices = (project: Project): Service[] => {
    if (!project.services) return []

    // Handle both array and join field formats
    if (Array.isArray(project.services)) {
      return project.services as Service[]
    }

    // Handle join field with docs array
    if (
      project.services &&
      typeof project.services === 'object' &&
      'docs' in project.services
    ) {
      return (project.services.docs || []) as Service[]
    }

    return []
  }

  // Filter logic
  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      // Search filter - search in project name and description
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const nameMatch = project.name?.toLowerCase().includes(searchTerm)
        const descriptionMatch = project.description
          ?.toLowerCase()
          .includes(searchTerm)

        if (!nameMatch && !descriptionMatch) {
          return false
        }
      }

      // Status filter - check database service statuses
      if (filters.status.length > 0) {
        const services = getProjectServices(project)
        const databaseServices = services.filter(
          service => service.type === 'database',
        )

        if (databaseServices.length > 0) {
          const hasMatchingStatus = databaseServices.some(
            service =>
              service.databaseDetails?.status &&
              filters.status.includes(service.databaseDetails.status),
          )
          if (!hasMatchingStatus) return false
        } else {
          // If no database services but status filter is applied, exclude
          return false
        }
      }

      // Service type filter
      if (filters.serviceType.length > 0) {
        const services = getProjectServices(project)
        const serviceTypes = services
          .map(service => service.type)
          .filter(Boolean)

        if (serviceTypes.length > 0) {
          const hasMatchingType = serviceTypes.some(type =>
            filters.serviceType.includes(type),
          )
          if (!hasMatchingType) return false
        } else {
          // If no services but service type filter is applied, exclude
          return false
        }
      }

      // Builder filter
      if (filters.builder.length > 0) {
        const services = getProjectServices(project)
        const builders = services
          .map(service => service.builder)
          .filter(Boolean) as string[]

        if (builders.length > 0) {
          const hasMatchingBuilder = builders.some(builder =>
            filters.builder.includes(builder),
          )
          if (!hasMatchingBuilder) return false
        } else {
          // If no builders but builder filter is applied, exclude
          return false
        }
      }

      // Server filter
      if (filters.server && filters.server !== 'all') {
        const projectServerId = getProjectServer(project)
        if (projectServerId !== filters.server) return false
      }

      // Provider filter - based on project's server provider
      if (filters.provider.length > 0) {
        const server = servers.find(s => s.id === getProjectServer(project))
        if (!server || !filters.provider.includes(server.provider || 'other')) {
          return false
        }
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const createdAt = new Date(project.createdAt)
        const now = new Date()

        let boundary: Date | null = null
        switch (filters.dateRange) {
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
            boundary = null
        }

        if (
          boundary &&
          !isAfter(createdAt, boundary) &&
          createdAt.getTime() !== boundary.getTime()
        ) {
          return false
        }
      }

      // Visibility filter - Fixed logic
      if (filters.visibility.length > 0) {
        const isHidden = !!project.hidden

        // If both visible and hidden are selected, allow all projects
        if (
          filters.visibility.includes('visible') &&
          filters.visibility.includes('hidden')
        ) {
          // Allow all projects through
        } else if (filters.visibility.includes('visible') && isHidden) {
          // Only visible selected but project is hidden
          return false
        } else if (filters.visibility.includes('hidden') && !isHidden) {
          // Only hidden selected but project is visible
          return false
        }
      }

      // Has services filter - Fixed logic
      if (filters.hasServices.length > 0) {
        const services = getProjectServices(project)
        const hasServices = services.length > 0

        // If both options are selected, allow all projects
        if (
          filters.hasServices.includes('with-services') &&
          filters.hasServices.includes('empty')
        ) {
          // Allow all projects through
        } else if (
          filters.hasServices.includes('with-services') &&
          !hasServices
        ) {
          // Only "with services" selected but project has no services
          return false
        } else if (filters.hasServices.includes('empty') && hasServices) {
          // Only "empty" selected but project has services
          return false
        }
      }

      return true
    })
  }, [allProjects, filters, servers])

  // Toggle filter value
  const toggleFilter = (category: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: Array.isArray(prev[category])
        ? (prev[category] as string[]).includes(value)
          ? (prev[category] as string[]).filter(v => v !== value)
          : [...(prev[category] as string[]), value]
        : [value],
    }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: [],
      serviceType: [],
      server: 'all',
      dateRange: 'all',
      visibility: [],
      builder: [],
      provider: [],
      hasServices: [],
    })
  }

  // Remove specific filter
  const removeFilter = (category: keyof FilterOptions, value: string) => {
    if (category === 'search') {
      setFilters(prev => ({ ...prev, [category]: '' }))
    } else if (category === 'server' || category === 'dateRange') {
      setFilters(prev => ({ ...prev, [category]: 'all' }))
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: (prev[category] as string[]).filter(v => v !== value),
      }))
    }
  }

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    count += filters.status.length
    count += filters.serviceType.length
    count += filters.builder.length
    count += filters.provider.length
    if (filters.server && filters.server !== 'all') count++
    if (filters.dateRange && filters.dateRange !== 'all') count++
    count += filters.visibility.length
    count += filters.hasServices.length
    return count
  }, [filters])

  // Get active filter labels for display
  const getActiveFilters = () => {
    const active = []

    if (filters.search) {
      active.push({
        type: 'search',
        value: filters.search,
        label: `"${filters.search}"`,
      })
    }

    filters.status.forEach(status => {
      const config = filterConfig.status.find(s => s.value === status)
      if (config)
        active.push({ type: 'status', value: status, label: config.label })
    })

    filters.serviceType.forEach(type => {
      const config = filterConfig.serviceType.find(t => t.value === type)
      if (config)
        active.push({ type: 'serviceType', value: type, label: config.label })
    })

    filters.builder.forEach(builder => {
      const config = filterConfig.builder.find(b => b.value === builder)
      if (config)
        active.push({ type: 'builder', value: builder, label: config.label })
    })

    filters.provider.forEach(provider => {
      const config = filterConfig.provider.find(p => p.value === provider)
      if (config)
        active.push({ type: 'provider', value: provider, label: config.label })
    })

    if (filters.server && filters.server !== 'all') {
      const server = servers.find(s => s.id === filters.server)
      active.push({
        type: 'server',
        value: filters.server,
        label: server?.name || filters.server,
      })
    }

    if (filters.dateRange && filters.dateRange !== 'all') {
      const config = filterConfig.dateRange.find(
        d => d.value === filters.dateRange,
      )
      if (config)
        active.push({
          type: 'dateRange',
          value: filters.dateRange,
          label: config.label,
        })
    }

    // filters.visibility.forEach(vis => {
    //   const config = filterConfig.visibility.find(v => v.value === vis)
    //   if (config)
    //     active.push({ type: 'visibility', value: vis, label: config.label })
    // })

    filters.hasServices.forEach(service => {
      const config = filterConfig.hasServices.find(s => s.value === service)
      if (config)
        active.push({
          type: 'hasServices',
          value: service,
          label: config.label,
        })
    })

    return active
  }

  return (
    <div className='space-y-4'>
      {/* Filter Controls */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <Filter className='h-4 w-4' />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs'>
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className='h-3 w-3' />
              </Button>
            </PopoverTrigger>

            <PopoverContent className='w-96 p-0' align='start'>
              {/* Fixed Header */}
              <div className='flex items-center justify-between border-b p-4'>
                <h4 className='font-medium'>Filter Projects</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearAllFilters}
                    className='h-6 px-2 text-xs'>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Scrollable Content */}
              <ScrollArea className='h-[500px]'>
                <div className='space-y-4 p-4'>
                  {/* Search */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Search</label>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        placeholder='Search projects...'
                        value={filters.search}
                        onChange={e =>
                          setFilters(prev => ({
                            ...prev,
                            search: e.target.value,
                          }))
                        }
                        className='pl-9'
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Service Status */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      Service Status
                    </label>
                    <div className='flex flex-wrap gap-1'>
                      {filterConfig.status.map(status => (
                        <Button
                          key={status.value}
                          variant={
                            filters.status.includes(status.value)
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() => toggleFilter('status', status.value)}
                          className='h-7 gap-1.5 text-xs'>
                          <div
                            className={`h-2 w-2 rounded-full ${status.color}`}
                          />
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Service Type */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Service Type</label>
                    <div className='flex flex-wrap gap-1'>
                      {filterConfig.serviceType.map(type => (
                        <Button
                          key={type.value}
                          variant={
                            filters.serviceType.includes(type.value)
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() =>
                            toggleFilter('serviceType', type.value)
                          }
                          className='h-7 gap-1.5 text-xs'>
                          <type.icon className='h-3 w-3' />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Builder */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Builder</label>
                    <div className='flex flex-wrap gap-1'>
                      {filterConfig.builder.map(builder => (
                        <Button
                          key={builder.value}
                          variant={
                            filters.builder.includes(builder.value)
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() => toggleFilter('builder', builder.value)}
                          className='h-7 gap-1.5 text-xs'>
                          <builder.icon className='h-3 w-3' />
                          {builder.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Server & Date Range */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Server</label>
                      <Select
                        value={filters.server}
                        onValueChange={value =>
                          setFilters(prev => ({ ...prev, server: value }))
                        }>
                        <SelectTrigger className='h-8'>
                          <SelectValue placeholder='All' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>All servers</SelectItem>
                          {servers.map(server => (
                            <SelectItem key={server.id} value={server.id}>
                              {server.name || server.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Created</label>
                      <Select
                        value={filters.dateRange}
                        onValueChange={value =>
                          setFilters(prev => ({ ...prev, dateRange: value }))
                        }>
                        <SelectTrigger className='h-8'>
                          <SelectValue placeholder='Any time' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>Any time</SelectItem>
                          {filterConfig.dateRange.map(date => (
                            <SelectItem key={date.value} value={date.value}>
                              {date.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Cloud Provider */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      Cloud Provider
                    </label>
                    <div className='flex flex-wrap gap-1'>
                      {filterConfig.provider.map(provider => (
                        <Button
                          key={provider.value}
                          variant={
                            filters.provider.includes(provider.value)
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() =>
                            toggleFilter('provider', provider.value)
                          }
                          className='h-7 gap-1.5 text-xs'>
                          <provider.icon className='h-3 w-3' />
                          {provider.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Visibility */}
                  {/* <div className='space-y-2'>
                    <label className='text-sm font-medium'>Visibility</label>
                    <div className='flex gap-1'>
                      {filterConfig.visibility.map(vis => (
                        <Button
                          key={vis.value}
                          variant={
                            filters.visibility.includes(vis.value)
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() => toggleFilter('visibility', vis.value)}
                          className='h-7 gap-1.5 text-xs'>
                          <vis.icon className='h-3 w-3' />
                          {vis.label}
                        </Button>
                      ))}
                    </div>
                  </div> */}

                  <Separator />

                  {/* Services */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Services</label>
                    <div className='flex flex-wrap gap-1'>
                      {filterConfig.hasServices.map(service => (
                        <Button
                          key={service.value}
                          variant={
                            filters.hasServices.includes(service.value)
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() =>
                            toggleFilter('hasServices', service.value)
                          }
                          className='h-7 gap-1.5 text-xs'>
                          <service.icon className='h-3 w-3' />
                          {service.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Results count */}
          <span className='text-sm text-muted-foreground'>
            {filteredProjects.length} of {allProjects.length} projects
          </span>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className='flex flex-wrap gap-2'>
          {getActiveFilters().map((filter, index) => (
            <Badge
              key={`${filter.type}-${filter.value}-${index}`}
              variant='secondary'
              className='gap-1'>
              {filter.label}
              <button
                title='removeFilter'
                type='button'
                onClick={() =>
                  removeFilter(filter.type as keyof FilterOptions, filter.value)
                }
                className='ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20'>
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filtered Results */}
      <div className='space-y-4'>
        {filteredProjects.length > 0 ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredProjects.map(project => {
              const services = getProjectServices(project)
              return (
                <ProjectCard
                  key={project.id}
                  organisationSlug={organisationSlug}
                  project={project}
                  servers={servers}
                  services={services}
                />
              )
            })}
          </div>
        ) : (
          <div className='rounded-lg border border-dashed bg-muted/10 p-8 text-center'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
              <Filter className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='mt-4 text-lg font-semibold'>
              No projects match your filters
            </h3>
            <p className='mt-2 text-muted-foreground'>
              Try adjusting your search criteria or clearing some filters.
            </p>
            <Button
              variant='outline'
              onClick={clearAllFilters}
              className='mt-4'>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectFiltersSection
