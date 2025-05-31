import Fastify from 'fastify';
import chatPlugin from './plugins/chat';
import wsPlugin from './ws';
import cors from '@fastify/cors';
import authRoutes from './routes/auth';
import fastifyWebsocket from '@fastify/websocket';

// Export a function to build the Fastify app (for testing or server)
export async function buildApp() {
  const fastify = Fastify({ logger: true });
  await fastify.register(cors, { origin: true });
  await fastify.register(chatPlugin);
  await fastify.register(wsPlugin);
  fastify.register(authRoutes); 
  fastify.register(fastifyWebsocket);
  // Minimal GET / route for health check or welcome message
  fastify.get('/', async (request, reply) => {
    return { message: 'ServiHub Chat API is running' };
  });

  return fastify;
}
