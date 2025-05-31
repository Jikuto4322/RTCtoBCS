import { buildApp } from './app';
import fastifyRateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';
import { verifyJWT } from './utils/jwt'; // <-- import your JWT utility

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function start() {
  const fastify = await buildApp();

  // Attach user info to req.user using your JWT utility
  fastify.addHook('onRequest', async (request, reply) => {
    const auth = request.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const payload = verifyJWT(auth.replace('Bearer ', ''));
        // @ts-ignore
        request.user = { id: payload.id };
      } catch {
        // Optionally handle invalid token (e.g., reply.code(401).send({ error: 'Invalid token' }))
      }
    }
  });

  await fastify.register(fastifyRateLimit, {
    max: 20, // 20 messages
    timeWindow: 5000, // per 5 seconds
    redis, // use Redis for distributed rate limiting
    keyGenerator: (req) => {
      // Use user ID from JWT for per-user rate limiting
      // @ts-ignore
      return req.user?.id || req.ip;
    },
    allowList: [], // Optionally allowlist some users/IPs
  });

  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

export const app = buildApp();
