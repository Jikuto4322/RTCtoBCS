import { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import { handleSocket } from './sockets';

export default async function (fastify: FastifyInstance) {
  await fastify.register(websocket);

  fastify.get('/ws', { websocket: true }, (connection, req) => {
    handleSocket(connection, req);
  });
}