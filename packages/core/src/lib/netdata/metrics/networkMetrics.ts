import { MetricsResponse, NetdataApiParams, NetdataContexts } from '../types'
import { formatTimestamp, getTimeSeriesData } from '../utils'

/**
 * Retrieves bandwidth metrics for individual physical network interfaces.
 * This tracks per-interface metrics like eth0, wlan0, etc.
 */
export const getNetworkBandwidth = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.NETWORK,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message:
        result.message || 'Failed to retrieve network interface bandwidth data',
      data: undefined,
    }
  }

  // Transform to match the expected format: { timestamp: 'HH:MM', incoming: number, outgoing: number }
  const formattedData = result.data.data.map((point: any) => {
    // For received (incoming) traffic
    let incoming = 0
    if (point.received !== undefined) {
      // Values are already in bytes/s, convert to MB/s
      // The values appear to be very small, so they might already be in MB/s or another unit
      // Check if value is already small (likely already in MB/s)
      if (Math.abs(point.received) < 1000) {
        incoming = parseFloat(Math.abs(point.received).toFixed(2))
      } else {
        // Convert from bytes/s to MB/s
        incoming = parseFloat(
          (Math.abs(point.received) / (1024 * 1024)).toFixed(2),
        )
      }
    }

    // For sent (outgoing) traffic - note that values are negative
    let outgoing = 0
    if (point.sent !== undefined) {
      // Use absolute value since sent traffic is represented as negative
      if (Math.abs(point.sent) < 1000) {
        outgoing = parseFloat(Math.abs(point.sent).toFixed(2))
      } else {
        outgoing = parseFloat((Math.abs(point.sent) / (1024 * 1024)).toFixed(2))
      }
    }

    return {
      timestamp: point.timestamp,
      fullTimestamp: point.fullTimestamp,
      incoming,
      outgoing,
    }
  })

  return {
    success: true,
    message: 'Network interface bandwidth retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves system-level network traffic metrics.
 * This tracks aggregate statistics across all network interfaces.
 */
export const getNetworkTraffic = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.NETWORK_TRAFFIC,
    undefined,
    minutes,
    false,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message:
        result.message || 'Failed to retrieve system network traffic data',
      data: undefined,
    }
  }

  // Get the data array and labels
  const dataPoints = result.data.data
  const labels = result.data.labels

  // Transform to match the expected format: { timestamp: 'HH:MM', incoming: number, outgoing: number }
  const formattedData = dataPoints.map((point: any) => {
    const { timestamp, fullTimestamp } = formatTimestamp(point[0], 1000)

    // Calculate total incoming traffic (sum of all 'received' values)
    let incoming = 0
    // Calculate total outgoing traffic (sum of all 'sent' values)
    let outgoing = 0

    // Loop through labels to find 'received' and 'sent' entries
    for (let i = 1; i < labels.length; i++) {
      if (labels[i] === 'received' && point[i] !== undefined) {
        // Convert to MB/s if needed
        if (Math.abs(point[i]) < 1000) {
          incoming += parseFloat(Math.abs(point[i]).toFixed(2))
        } else {
          incoming += parseFloat(
            (Math.abs(point[i]) / (1024 * 1024)).toFixed(2),
          )
        }
      } else if (labels[i] === 'sent' && point[i] !== undefined) {
        // Use absolute value since sent traffic is represented as negative
        if (Math.abs(point[i]) < 1000) {
          outgoing += parseFloat(Math.abs(point[i]).toFixed(2))
        } else {
          outgoing += parseFloat(
            (Math.abs(point[i]) / (1024 * 1024)).toFixed(2),
          )
        }
      }
    }

    return {
      timestamp,
      fullTimestamp,
      incoming,
      outgoing,
    }
  })

  return {
    success: true,
    message: 'System network traffic retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves network packet metrics.
 */
export const getNetworkPackets = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.NETWORK_PACKETS,
    undefined,
    minutes,
    false,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve network packets data',
      data: undefined,
    }
  }

  // Get the data array and labels
  const dataPoints = result.data.data
  const labels = result.data.labels

  // Transform to match the expected format: { timestamp: 'HH:MM:SS', received: number, sent: number, dropped: number }
  const formattedData = dataPoints.map((point: any) => {
    const { timestamp, fullTimestamp } = formatTimestamp(point[0], 1000)

    // Calculate totals for received, sent, and dropped packets
    let received = 0
    let sent = 0
    let dropped = 0

    // Loop through labels to find 'received', 'sent', and 'multicast' entries
    for (let i = 1; i < labels.length; i++) {
      if (labels[i] === 'received' && point[i] !== undefined) {
        received += Math.abs(point[i])
      } else if (labels[i] === 'sent' && point[i] !== undefined) {
        sent += Math.abs(point[i]) // Absolute value since sent values are negative
      } else if (labels[i] === 'multicast' && point[i] !== undefined) {
        // If you want to track multicast packets as dropped, add them here
        // dropped += Math.abs(point[i]);
      }
    }

    // Round values for better readability
    received = parseFloat(received.toFixed(2))
    sent = parseFloat(sent.toFixed(2))
    dropped = parseFloat(dropped.toFixed(2))

    return {
      timestamp,
      fullTimestamp,
      received,
      sent,
      dropped,
    }
  })

  return {
    success: true,
    message: 'Network packets retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves network error metrics.
 */
export const getNetworkErrors = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.NETWORK_ERRORS,
    undefined,
    minutes,
    false,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve network errors data',
      data: undefined,
    }
  }

  // Get the data array and labels
  const dataPoints = result.data.data
  const labels = result.data.labels

  // Transform to match the expected format: { timestamp: 'HH:MM:SS', inbound: number, outbound: number }
  const formattedData = dataPoints.map((point: any) => {
    const { timestamp, fullTimestamp } = formatTimestamp(point[0], 1000)

    // Calculate total inbound and outbound errors
    let inbound = 0
    let outbound = 0

    // Loop through labels to find 'inbound' and 'outbound' error entries
    for (let i = 1; i < labels.length; i++) {
      if (labels[i] === 'inbound' && point[i] !== undefined) {
        inbound += Math.abs(point[i])
      } else if (labels[i] === 'outbound' && point[i] !== undefined) {
        outbound += Math.abs(point[i])
      }
    }

    // Round values for better readability
    inbound = parseFloat(inbound.toFixed(2))
    outbound = parseFloat(outbound.toFixed(2))

    return {
      timestamp,
      fullTimestamp,
      inbound,
      outbound,
    }
  })

  return {
    success: true,
    message: 'Network errors retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}
