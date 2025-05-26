import { FastifyInstance } from 'fastify';
import chatRoutes from '../routes/chat';

export default async function (fastify: FastifyInstance) {
  // Register chat routes as a plugin
  await fastify.register(chatRoutes);
}