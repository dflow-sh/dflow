'use server'

import { NodeSSH } from 'node-ssh'

export interface ResourceStatus {
  memoryMB: number
  diskGB: number
  cpuLoad: number
  cpuUtilization: number // Add actual CPU utilization percentage
  runningContainers: number
  totalMemoryMB: number
  totalDiskGB: number
  cpuCores: number
}

export type ServiceType = 'app' | 'docker' | 'database'

export interface ResourceCheckOptions {
  minMemoryMB?: number
  minDiskGB?: number
  maxCpuLoad?: number
  serviceType?: ServiceType
  // Remove maxContainers since it will be calculated based on server capacity
}

export const checkServerResources = async (
  ssh: NodeSSH,
  options: ResourceCheckOptions = {},
): Promise<{ capable: boolean; status: ResourceStatus; reason?: string }> => {
  // Set REQUIRED resources for each service type
  let requiredMemory = 512,
    requiredDisk = 2,
    maxAllowedCpuLoad = 0.8 // 80% of available CPU cores

  switch (options.serviceType) {
    case 'app':
      requiredMemory = 512 // App needs 512MB
      requiredDisk = 2 // App needs 2GB
      break
    case 'docker':
      requiredMemory = 256 // Docker service needs 256MB
      requiredDisk = 1 // Docker service needs 1GB
      break
    case 'database':
      requiredMemory = 1024 // Database needs 1GB
      requiredDisk = 5 // Database needs 5GB
      break
    default:
      requiredMemory = 512
      requiredDisk = 2
  }

  // Allow explicit overrides
  const {
    minMemoryMB = requiredMemory,
    minDiskGB = requiredDisk,
    maxCpuLoad = maxAllowedCpuLoad,
  } = options

  // Get comprehensive server information
  const cmd = `printf '%s|' \
  "$(free -m | grep Mem | awk '{print $7}' || echo 0)" \
  "$(df -BG --output=avail / | tail -1 | tr -dc '0-9' || echo 0)" \
  "$(cat /proc/loadavg | awk '{print $1}' || echo 0)" \
  "$(docker ps -q | wc -l 2>/dev/null || echo 0)" \
  "$(free -m | grep Mem | awk '{print $2}' || echo 0)" \
  "$(df -BG --output=size / | tail -1 | tr -dc '0-9' || echo 0)" \
  "$(nproc || echo 1)" \
  "$(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | sed 's/%us,//' 2>/dev/null || echo 0)"`

  const { stdout } = await ssh.execCommand(cmd)
  const lines = stdout.trim().split('|').filter(Boolean)

  if (lines.length !== 8) {
    return {
      capable: false,
      status: null as any,
      reason: 'Unexpected output from resource check: ' + stdout,
    }
  }

  const [
    availableMemory,
    availableDisk,
    currentCpuLoad,
    currentContainers,
    totalMemory,
    totalDisk,
    cpuCores,
    cpuUtilization,
  ] = lines.map(Number)

  const status: ResourceStatus = {
    memoryMB: isNaN(availableMemory) ? 0 : availableMemory,
    diskGB: isNaN(availableDisk) ? 0 : availableDisk,
    cpuLoad: isNaN(currentCpuLoad) ? 0 : currentCpuLoad,
    cpuUtilization: isNaN(cpuUtilization) ? 0 : cpuUtilization,
    runningContainers: isNaN(currentContainers) ? 0 : currentContainers,
    totalMemoryMB: isNaN(totalMemory) ? 0 : totalMemory,
    totalDiskGB: isNaN(totalDisk) ? 0 : totalDisk,
    cpuCores: isNaN(cpuCores) ? 1 : cpuCores,
  }

  // Fallback: If CPU utilization is 0 or invalid, calculate from load average
  if (status.cpuUtilization === 0 && status.cpuLoad > 0) {
    // More accurate calculation: limit to 100% max
    status.cpuUtilization = Math.min(
      Math.round((status.cpuLoad / status.cpuCores) * 100),
      100,
    )
  }

  // Ensure CPU utilization is never negative
  status.cpuUtilization = Math.max(status.cpuUtilization, 0)

  // Calculate dynamic server capacity based on actual hardware
  const maxAllowedCpuLoadValue = maxCpuLoad * cpuCores // e.g., 0.8 * 4 cores = 3.2

  // Dynamic container limit based on available memory
  // Assuming each container needs at least 128MB on average
  const avgContainerMemoryMB = 128
  const maxContainersBasedOnMemory = Math.floor(
    totalMemory / avgContainerMemoryMB,
  )

  // Conservative estimate: use 80% of theoretical max containers
  const maxAllowedContainers = Math.floor(maxContainersBasedOnMemory * 0.8)

  // Check if server has enough AVAILABLE resources for the new service
  if (availableMemory < minMemoryMB) {
    return {
      capable: false,
      status,
      reason: `Insufficient available memory. Required: ${minMemoryMB}MB, Available: ${availableMemory}MB (Total: ${totalMemory}MB)`,
    }
  }

  if (availableDisk < minDiskGB) {
    return {
      capable: false,
      status,
      reason: `Insufficient available disk space. Required: ${minDiskGB}GB, Available: ${availableDisk}GB (Total: ${totalDisk}GB)`,
    }
  }

  if (currentCpuLoad > maxAllowedCpuLoadValue) {
    return {
      capable: false,
      status,
      reason: `Server CPU load too high. Current: ${currentCpuLoad}, Max allowed: ${maxAllowedCpuLoadValue} (${cpuCores} cores)`,
    }
  }

  if (currentContainers >= maxAllowedContainers) {
    return {
      capable: false,
      status,
      reason: `Server at container capacity. Current: ${currentContainers}, Max estimated: ${maxAllowedContainers} (based on ${totalMemory}MB total memory)`,
    }
  }

  console.log({ status })

  return { capable: true, status }
}
