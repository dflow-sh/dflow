import { LoaderInput } from 'nuqs'
import { APIError, PayloadHandler } from 'payload'

import { sub } from '@/lib/redis'
import { loadServiceLogs } from '@/lib/searchParams'

export const serverEvents: PayloadHandler = async ({
  headers,
  payload,
  query,
  signal,
}) => {
  const auth = await payload.auth({ headers })

  // Throwing 401 if no user is present
  if (!auth.user) {
    throw new APIError('Unauthenticated', 401)
  }

  const { serverId, serviceId } = loadServiceLogs(query as LoaderInput)

  const channel = `channel-${serverId}${serviceId ? `-${serviceId}` : ''}`
  const encoder = new TextEncoder()

  const duplicateSubscriber = sub.duplicate()
  let keepAliveInterval: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      // Send initial message to client
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            message: `🔄 Connecting to channel: ${channel}...`,
          })}\n\n`,
        ),
      )

      const sendEvent = (channel: string, message: string) => {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                message,
              })}\n\n`,
            ),
          )
        } catch (error) {
          console.error('Error sending event:', error)
        }
      }

      // Set up keepalive to prevent connection timeouts
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ keepalive: true })}\n\n`),
          )
        } catch (error) {
          // If we can't send keepalive, the connection is probably closed
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval)
            keepAliveInterval = null
          }
        }
      }, 30000)

      // Subscribe to a Redis channel
      duplicateSubscriber.subscribe(channel, err => {
        if (err) {
          console.error('Redis Subscribe Error:', err)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                message: `Failed to subscribe to channel: ${err.message}`,
              })}\n\n`,
            ),
          )
          controller.close()
          return
        }

        // Send success message to client
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              message: `✅ Successfully connected to channel: ${channel}`,
            })}\n\n`,
          ),
        )
      })

      duplicateSubscriber.on('message', sendEvent)

      // Handle Redis errors
      duplicateSubscriber.on('error', error => {
        console.error('Redis connection error:', error)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              message: `Redis error: ${error.message}`,
            })}\n\n`,
          ),
        )
        controller.close()
      })

      // Handle abort signal from the request
      signal?.addEventListener('abort', () => {
        cleanup()
      })
    },

    cancel() {
      cleanup()
    },
  })

  // Define cleanup function to avoid code duplication
  const cleanup = () => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval)
      keepAliveInterval = null
    }

    try {
      duplicateSubscriber.unsubscribe(channel)
      duplicateSubscriber.quit() // Properly close the connection
    } catch (error) {
      console.error('Error during Redis cleanup:', error)
    }

    console.log(`Closed SSE connection for channel: ${channel}`)
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
