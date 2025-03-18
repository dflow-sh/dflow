import { NetdataApiResponse } from '../types'

export interface NodeInfoResponse extends NetdataApiResponse {
  data?: {
    version: string // Netdata version
    nodeId: string // Netdata unique ID
    mirrored_hosts: string[] // List of hosts mirrored (includes itself)
    os: {
      name: string // Operating System name
      version: string // Operating System version
      id: string // Operating System ID
      kernel: string // Kernel version
    }
    virtualization?: {
      type: string // Virtualization type
      provider: string // Virtualization provider
    }
    kubernetes?: {
      node: string // K8s node name
      cluster: string // K8s cluster name
    }
    container?: {
      technology: string // Container technology
      id: string // Container ID
    }
    collectors: {
      [plugin: string]: {
        modules: string[] // List of active modules for this plugin
      }
    }
    streaming: {
      enabled: boolean // Whether streaming is enabled
      senders: number // Number of senders
      receivers: number // Number of receivers
    }
    alarms: {
      total: number // Total number of alarms
      normal: number // Number of alarms in normal state
      warning: number // Number of alarms in warning state
      critical: number // Number of alarms in critical state
    }
  }
}
