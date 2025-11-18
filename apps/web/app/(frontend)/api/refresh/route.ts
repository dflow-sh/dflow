import { NextRequest } from 'next/server'

import { sub } from '@/lib/redis'

export const config = {
  runtime: 'nodejs', // Ensures it runs in a proper Node environment
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const searchParams = req.nextUrl.searchParams
  const duplicateSubscriber = sub.duplicate()

  const organisation = searchParams.get('organisation') ?? ''

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (channel: string, message: string) => {
        console.log(`Got message ${channel}-channel ${message}`)

        controller.enqueue(encoder.encode(`data: ${message}\n\n`))
      }

      // Subscribe to a Redis channel
      duplicateSubscriber.subscribe(`refresh-channel-${organisation}`, err => {
        if (err) console.error('Redis Subscribe Error:', err)
      })

      duplicateSubscriber.on('message', sendEvent)

      duplicateSubscriber.on('error', err => {
        console.log('error', err.message)
      })

      duplicateSubscriber.on('connect', () => {
        console.log(`Connected to refresh-channel-${organisation}`)
      })

      // Use a separate client for the keepalive ping
      const keepAlive = setInterval(() => {
        // Don't use the subscription client for anything other than subscription
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ keepalive: true })}\n\n`),
        )
      }, 29000)

      req.signal.addEventListener('abort', () => {
        duplicateSubscriber.unsubscribe(`refresh-channel-${organisation}`)
        duplicateSubscriber.off('message', sendEvent)
        clearInterval(keepAlive)
        // Close the connection when done
        duplicateSubscriber.quit().catch(() => {})
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
