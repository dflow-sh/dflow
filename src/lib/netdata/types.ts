import { SSHExecCommandOptions } from 'node-ssh'

// Common parameters for all API functions
export interface NetdataApiParams {
  options?: SSHExecCommandOptions
  host?: string // Optional host, defaults to localhost
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
