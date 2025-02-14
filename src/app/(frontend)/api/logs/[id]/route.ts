import { NextRequest } from 'next/server'

import { addClient, removeClient, sendMessageToClient } from '@/lib/clients'
import { sshConnect } from '@/lib/ssh'

export const maxDuration = 60000 // Max duration for the stream in milliseconds (e.g., 1 minute)

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const syncParams = await context.params
  const id = syncParams.id.toString()

  const ssh = await sshConnect()
  console.log({ ssh })

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()
  const clientId = id

  try {
    writer.write(encoder.encode('data: { "started": true }\n\n'))
    addClient(clientId, writer)

    ssh.execCommand(`dokku logs random-app-by-pavan-2`, {
      onStdout: chunk => {
        console.log('log', chunk.toString())
        sendMessageToClient(clientId, chunk.toString())
      },
    })

    req.signal.addEventListener('abort', () => {
      removeClient(clientId)
      writer.close()
    })
  } catch (error) {
    removeClient(clientId)
    writer.close()
  }

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
