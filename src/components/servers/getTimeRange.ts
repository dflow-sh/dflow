export const getTimeRange = (data: { time: string }[]) => {
  if (data.length < 2) return 'No data available'

  // Reverse data to ensure ascending order (earliest to latest)
  const sortedData = [...data].reverse()

  // Get today's date (assuming data is from today)
  const today = new Date().toISOString().split('T')[0]

  // Convert time strings to full timestamps
  const firstTimestamp = new Date(`${today}T${sortedData[0].time}:00`)
  const lastTimestamp = new Date(
    `${today}T${sortedData[sortedData.length - 1].time}:00`,
  )

  if (isNaN(firstTimestamp.getTime()) || isNaN(lastTimestamp.getTime())) {
    return 'Invalid time data'
  }

  const diffInMinutes = Math.round(
    (lastTimestamp.getTime() - firstTimestamp.getTime()) / (1000 * 60),
  )

  if (diffInMinutes >= 1440) {
    return `Last ${Math.round(diffInMinutes / 1440)} days`
  } else if (diffInMinutes >= 60) {
    return `Last ${Math.round(diffInMinutes / 60)} hours`
  } else {
    return `Last ${diffInMinutes} minutes`
  }
}
