'use server'

import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

export const getServerDetails = async (
  params: NetdataApiParams,
): Promise<any> => {
  try {
    // Fetch system info
    const info = await netdataAPI(params, 'info')

    // Detailed server details with improved formatting and relevance
    const serverDetails = {
      kernel: {
        name: info.kernel_name || 'Linux',
        version: info.kernel_version || 'Unknown',
        architecture: info.architecture || 'Unknown',
      },
      os: {
        name: info.os_name || 'Unknown',
        version: info.os_version || 'Unknown',
        distribution: info.os_id || 'Unknown',
        full_version: info.os_version_id
          ? `${info.os_name} ${info.os_version_id}`
          : 'Unknown',
      },
      hardware: {
        cpu: {
          cores: info.cores_total || 'Unknown',
          frequency: `${(parseInt(info.cpu_freq) / 1_000_000_000).toFixed(2) || 'Unknown'} GHz`,
          model: info.host_labels?._system_cpu_model || 'Unknown',
        },
        memory: {
          total: `${(parseInt(info.ram_total) / (1024 * 1024 * 1024)).toFixed(2) || 'Unknown'} GB`,
          type: 'RAM',
        },
        storage: {
          total: `${(parseInt(info.total_disk_space) / (1024 * 1024 * 1024)).toFixed(2) || 'Unknown'} GB`,
        },
        virtualization: {
          type: info.virtualization || 'Unknown',
          detection_method: info.virt_detection || 'Unknown',
        },
      },
      network: {
        hostname: info.host_labels?._hostname || 'Unknown',
        timezone: {
          name: info.host_labels?._timezone || 'Unknown',
          abbreviation: info.host_labels?._abbrev_timezone || 'Unknown',
        },
        cloud: {
          provider: info.cloud_provider_type || 'Unknown',
          instance_type: info.cloud_instance_type || 'Unknown',
          region: info.cloud_instance_region || 'Unknown',
        },
      },
      system: {
        kubernetes: {
          is_node: info.is_k8s_node === 'true',
          node_type:
            info.is_k8s_node === 'true'
              ? 'Kubernetes Node'
              : 'Standalone Server',
        },
        container: {
          runtime: info.container || 'None',
          detection: info.container_detection || 'Unknown',
        },
        netdata: {
          version: info.version || 'Unknown',
          release_channel: info['release-channel'] || 'Unknown',
          cloud_enabled: info['cloud-enabled'] === true,
          web_enabled: info['web-enabled'] === true,
          https_enabled: info['https-enabled'] === true,
        },
        installation: {
          type: info.host_labels?._install_type || 'Unknown',
          is_ephemeral: info.host_labels?._is_ephemeral === 'true',
        },
      },
      features: {
        collectors: Array.isArray(info.collectors)
          ? info.collectors
              .map(
                (c: { plugin: string; module?: string }) =>
                  `${c.plugin}${c.module ? `: ${c.module}` : ''}`,
              )
              .slice(0, 10)
          : [],
        services: Object.keys(info.functions || {}).slice(0, 10),
      },
    }

    return serverDetails
  } catch (error) {
    console.error('Failed to fetch server details:', error)
    // throw error
  }
}
