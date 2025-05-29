import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { convertBigInts } from '../utils/convertBigInts';
import { signUserJwt } from '../utils/jwt';

const prisma = new PrismaClient();

export default async function (fastify: FastifyInstance) {
  // Registration
  fastify.post('/register', async (request, reply) => {
    const { name, email, password } = request.body as { name: string, email: string, password: string };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.status(400).send({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    const safeUser = convertBigInts(user);
    reply.send({ id: safeUser.id, name: safeUser.name, email: safeUser.email });
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string, password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return reply.status(401).send({ error: 'Invalid credentials' });

    const safeUser = convertBigInts(user);
    const token = signUserJwt(safeUser);

    reply.send({ token, user: { id: safeUser.id, name: safeUser.name, email: safeUser.email } });
  });
}