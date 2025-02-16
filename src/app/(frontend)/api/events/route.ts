import { NextRequest } from 'next/server'

export const config = {
  runtime: 'nodejs', // Ensures it runs in a proper Node environment
}

export async function GET(req: NextRequest) {
  const { sub } = await import('@/lib/redis')
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (channel: string, message: string) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`))
      }

      // Subscribe to a Redis channel
      sub.subscribe('my-channel', err => {
        if (err) console.error('Redis Subscribe Error:', err)
      })

      sub.on('message', sendEvent)

      req.signal.addEventListener('abort', () => {
        sub.unsubscribe('my-channel')
        sub.off('message', sendEvent)
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
