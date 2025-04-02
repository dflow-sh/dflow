export const getTimeRange = (data: { timestamp: string }[]) => {
  if (data.length < 2) return 'No data available'

  // Sort data to ensure chronological order (earliest to latest)
  const sortedData = [...data].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  )

  // Function to convert HH:mm:ss to total seconds for comparison
  const timeToSeconds = (time: string) => {
    const [hours, minutes, seconds] = time.split(':').map(Number)
    return hours * 3600 + minutes * 60 + seconds
  }

  // Get first and last timestamps in total seconds
  const firstTime = timeToSeconds(sortedData[0].timestamp)
  const lastTime = timeToSeconds(sortedData[sortedData.length - 1].timestamp)

  // Handle overnight cases (e.g., 23:59:59 to 00:00:01)
  let diffInSeconds = lastTime - firstTime
  if (diffInSeconds < 0) {
    diffInSeconds += 24 * 3600 // Add 24 hours if crossing midnight
  }

  const diffInMinutes = Math.round(diffInSeconds / 60)

  if (diffInMinutes >= 1440) {
    return `Last ${Math.round(diffInMinutes / 1440)} days`
  } else if (diffInMinutes >= 60) {
    return `Last ${Math.round(diffInMinutes / 60)} hours`
  } else {
    return `Last ${diffInMinutes} minutes`
  }
}
