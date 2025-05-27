import { FastifyRequest } from 'fastify';
import { RawData, WebSocket } from 'ws';

// In-memory store for demo (replace with Redis/pubsub for production)
const clients: Set<WebSocket> = new Set();

export function handleSocket(ws: WebSocket, req: FastifyRequest) {
  clients.add(ws);

  ws.on('message', (data: RawData) => {
    try {
      const msg = JSON.parse(data.toString());
      // Example: { type: 'message', payload: { conversationId, senderId, body } }
      if (msg.type === 'message') {
        // Broadcast to all clients (filter by conversationId in real app)
        for (const client of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'message',
              payload: msg.payload,
            }));
          }
        }
        // TODO: Save to DB here if needed
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    // Optionally broadcast presence/offline
  });

  // Optionally handle ping/pong, presence, etc.
}