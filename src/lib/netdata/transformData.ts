/**
 * Helper function to transform raw data based on labels
 */
export function transformData(labels: string[], dataPoints: any[]): any[] {
  const result: any[] = []

  for (const point of dataPoints) {
    const timestamp = point[0] // First element is always timestamp
    const timeStr = formatTimestamp(timestamp)

    const transformedPoint: Record<string, string | number> = {
      timestamp: timeStr,
    }

    // Simply map all values starting from index 1
    for (let i = 1; i < labels.length; i++) {
      transformedPoint[labels[i]] = point[i]
    }

    result.push(transformedPoint)
  }

  return result
}

/**
 * Formats a Unix timestamp to a time string in HH:MM:SS format
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toTimeString().substring(0, 8) // HH:MM:SS format
}
