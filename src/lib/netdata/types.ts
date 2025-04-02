import { SSHExecCommandOptions } from 'node-ssh'

export interface NetdataApiParams {
  options?: SSHExecCommandOptions
  host: string // Optional host, defaults to localhost
  port?: number // Optional port, defaults to 19999
  after?: number // Start timestamp for data
  before?: number // End timestamp for data
  points?: number // Number of data points to return
  group?: string // Group method (average, sum, min, max)
  dimensions?: string | string[] // Dimensions to include in the query (for v2 API)
  nodes?: string | string[] // Nodes to include in the query (for v2 API)
  contexts?: string | string[] // Contexts to include in the query (for v2 API)
}

// Base response type
export interface NetdataApiResponse {
  success: boolean
  message: string
  error?: string
  data?: any
}

// CPU specific response
export interface CpuMetricsResponse extends NetdataApiResponse {
  data?: {
    total: number // Total CPU usage percentage
    user: number // User CPU usage percentage
    system: number // System CPU usage percentage
    iowait?: number // IO wait percentage
    irq?: number // IRQ percentage
    softirq?: number // Soft IRQ percentage
    idle: number // Idle percentage
    steal?: number // CPU steal percentage
    cores?: { [core: string]: number } // Per-core utilization
    loadAverage?: {
      '1min': number
      '5min': number
      '15min': number
    }
  }
}

// Memory specific response
export interface MemoryMetricsResponse extends NetdataApiResponse {
  data?: {
    total: number // Total memory in bytes
    used: number // Used memory in bytes
    free: number // Free memory in bytes
    cached: number // Cached memory in bytes
    buffers?: number // Buffer memory in bytes
    usedPercentage: number // Percentage of memory used
    swapTotal?: number // Total swap in bytes
    swapUsed?: number // Used swap in bytes
    swapFree?: number // Free swap in bytes
    swapUsedPercentage?: number // Percentage of swap used
  }
}

// Disk specific response
export interface DiskMetricsResponse extends NetdataApiResponse {
  data?: {
    disks: {
      [disk: string]: {
        total: number // Total disk space in bytes
        used: number // Used disk space in bytes
        free: number // Free disk space in bytes
        usedPercentage: number // Percentage of disk used
        mountPoint: string // Disk mount point
      }
    }
    io?: {
      [disk: string]: {
        reads: number // Reads per second
        writes: number // Writes per second
        readBytes: number // Bytes read per second
        writeBytes: number // Bytes written per second
        busy?: number // Percentage of time disk was busy
      }
    }
  }
}

// Network specific response
export interface NetworkMetricsResponse extends NetdataApiResponse {
  data?: {
    interfaces: {
      [iface: string]: {
        received: number // Bytes received per second
        sent: number // Bytes sent per second
        receivedPackets?: number // Packets received per second
        sentPackets?: number // Packets sent per second
        errors?: number // Errors per second
        drops?: number // Dropped packets per second
      }
    }
    connections?: {
      established: number
      listening: number
      timeWait: number
      closeWait?: number
      total: number
    }
  }
}

// Request/HTTP specific response
export interface RequestsMetricsResponse extends NetdataApiResponse {
  data?: {
    requests: number // Total requests per second
    successfulRequests: number // Successful requests per second
    clientErrors?: number // Client error responses per second
    serverErrors?: number // Server error responses per second
    bandwidthIn?: number // Bytes received per second
    bandwidthOut?: number // Bytes sent per second
    responseTime?: number // Average response time in ms
    // Optional service-specific data
    services?: {
      [service: string]: {
        requests: number
        errors?: number
        bandwidth?: number
        responseTime?: number
      }
    }
  }
}

// System specific response
export interface SystemMetricsResponse extends NetdataApiResponse {
  data?: {
    uptime: number // System uptime in seconds
    processes: {
      running: number
      blocked?: number
      total: number
      threadsTotal?: number
    }
    users?: number // Number of logged in users
    temperature?: {
      // System temperatures
      [sensor: string]: number
    }
    updates?: {
      // Available system updates
      security: number
      regular: number
      total: number
    }
  }
}

/**
 * Common response type for all metric functions
 */
export interface MetricsResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface MetricsResponse<T> {
  success: boolean
  message: string
  data?: T
}

// Define standard metrics interface for different system resources
export interface SystemMetrics {
  timestamp: string
  value: number
}

// Specific interfaces for different metric types can be extended from this
export interface CPUMetrics extends SystemMetrics {
  user?: number
  system?: number
  idle?: number
}

export interface MemoryMetrics extends SystemMetrics {
  used?: number
  cached?: number
  buffers?: number
  available?: number
}

export interface NetworkMetrics extends SystemMetrics {
  received?: number
  sent?: number
}

export interface DiskMetrics extends SystemMetrics {
  reads?: number
  writes?: number
}

export interface RequestMetrics extends SystemMetrics {
  total?: number
  successful?: number
  failed?: number
}

export enum NetdataContexts {
  // CPU-specific metrics
  CPU = 'system.cpu',
  CPU_SOME_PRESSURE = 'system.cpu_some_pressure',
  CPU_PRESSURE_STALL_TIME = 'system.cpu_some_pressure_stall_time',
  CPU_FREQ = 'cpu.cpufreq',
  CPU_SCALING = 'cpu.cpuscaling',
  CPU_THERMAL = 'cpu.thermal',

  // System-level metrics
  RAM = 'system.ram',
  LOAD = 'system.load',
  NETWORK = 'system.net',
  INTERRUPTS = 'system.interrupts',
  SOFTNET = 'system.softnet',
  PROCESSES = 'system.processes',
  SYSTEM_IO = 'system.io',
  ALARMS = 'alarms?all',

  // Disk-specific metrics
  DISK_IO = 'disk.io',
  DISK_SPACE = 'disk.space',
  DISK_OPERATIONS = 'disk.ops',
  DISK_BYTES = 'disk.bytes',
  DISK_IOPS = 'disk.iops',
  DISK_UTIL = 'disk.util',

  // Uptime metrics
  SERVER_UPTIME = 'system.uptime',

  // Network-specific metrics
  NETWORK_TRAFFIC = 'net.net',
  NETWORK_PACKETS = 'net.packets',
  NETWORK_ERRORS = 'net.errors',
  NETWORK_DROPS = 'net.drops',

  // Memory-specific metrics
  MEMORY_AVAILABLE = 'mem.available',
  MEMORY_SOME_PRESSURE = 'system.memory_some_pressure',
  MEMORY_PRESSURE_STALL_TIME = 'system.memory_some_pressure_stall_time',
  MEMORY_NUMA = 'system.numa',
  MEMORY_KERNEL = 'system.kernel_memory',
  MEMORY_SLAB = 'system.slab',

  // Filesystem metrics
  FILESYSTEM_INODES = 'filesystem.inodes',

  // Networking protocols
  TCP_CONNECTIONS = 'tcp.connections',
  UDP_CONNECTIONS = 'udp.connections',

  // Web and Application servers
  REQUESTS = 'system.web_server_requests',
  HTTP_REQUESTS = 'httpd.requests',
  NGINX_CONNECTIONS = 'nginx.connections',
  APACHE_CONNECTIONS = 'apache.connections',

  // Database metrics
  MYSQL_QUERIES = 'mysql.queries',
  POSTGRESQL_QUERIES = 'postgres.queries',
  MONGODB_OPERATIONS = 'mongodb.operations',
  REDIS_OPERATIONS = 'redis.operations',

  // System services
  SYSTEMD_UNITS = 'systemd.units',
  SERVICES_CPU = 'services.cpu',
  SERVICES_MEMORY = 'services.mem',

  // Containers and virtualization
  DOCKER_CONTAINERS = 'docker.containers',
  KUBERNETES_PODS = 'k8s.pods',
  VIRTUAL_MACHINES = 'libvirt.domains',

  // Power and thermal
  SYSTEM_POWER = 'system.power',
  BATTERY = 'system.battery',

  // Sensors and hardware
  SENSORS_TEMPERATURE = 'sensors.temperature',
  SENSORS_VOLTAGE = 'sensors.voltage',
  SENSORS_CURRENT = 'sensors.current',

  // Caches
  MEMCACHED_OPERATIONS = 'memcached.operations',
  REDIS_MEMORY = 'redis.memory',

  // Specific application metrics
  PHP_FPM_PROCESSES = 'phpfpm.processes',
  NODEJS_METRICS = 'nodejs.metrics',

  // Logging and monitoring
  SYSTEM_ERRORS = 'system.errors',
  SYSTEM_LOGS = 'system.logs',

  // Performance metrics
  CONTEXT_SWITCHES = 'system.context_switches',
  SYSTEM_FORKS = 'system.forks',
}

export function getAllNetdataContexts(): string[] {
  return Object.values(NetdataContexts)
}
