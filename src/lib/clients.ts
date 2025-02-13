type Client = {
  id: string
  res: WritableStreamDefaultWriter<Uint8Array>
  isClosed: boolean // Track whether the stream is closed
}

// An array to store connected clients
const clients: Client[] = []

/**
 * Adds a new client to the list of connected clients.
 *
 * @param id - The unique identifier of the client.
 * @param res - The writable stream associated with the client, allowing us to send data to the client.
 */
export function addClient(
  id: string,
  res: WritableStreamDefaultWriter<Uint8Array>,
): void {
  clients.push({ id, res, isClosed: false }) // Initialize isClosed as false
}

/**
 * Removes a client from the list of connected clients by their ID.
 *
 * @param id - The unique identifier of the client to be removed.
 */
export function removeClient(id: string): void {
  const index = clients.findIndex(client => client.id === id)
  if (index !== -1) {
    clients.splice(index, 1)
  }
}

/**
 * Sends a message to a specific client by their ID.
 *
 * @param id - The unique identifier of the client.
 * @param message - The message to send to the client, formatted according to the SSE protocol.
 */
export async function sendMessageToClient(
  id: string,
  message: string,
): Promise<void> {
  const client = clients.find(client => client.id === id)

  if (client && !client.isClosed) {
    try {
      // Ensure the stream is ready
      await client.res.ready

      // If the stream is not closed, send the message
      if (!client.isClosed) {
        client.res.write(new TextEncoder().encode(`data: ${message}\n\n`))
      }
    } catch (error) {
      console.error(`Failed to send message to client ${id}:`, error)

      // Mark the stream as closed and remove the client if writing fails
      client.isClosed = true
      removeClient(id)

      try {
        client.res.close()
      } catch (closeError) {
        console.error(`Error closing stream for client ${id}:`, closeError)
      }
    }
  } else {
    console.warn(`Client with ID ${id} not found or stream is closed.`)
  }
}

/**
 * Returns the number of currently connected clients.
 *
 * @returns The number of clients currently stored in memory.
 */
export function getClientsCount(): number {
  return clients.length
}
