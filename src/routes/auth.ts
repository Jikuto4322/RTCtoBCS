import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export default async function (fastify: FastifyInstance) {
  // Registration
  fastify.post('/register', async (request, reply) => {
    console.log(request.body);
    const { name, email, password } = request.body as { name: string, email: string, password: string };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.status(400).send({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });
    reply.send({ id: user.id, name: user.name, email: user.email });
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    console.log(request.body);
    const { email, password } = request.body as { email: string, password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return reply.status(401).send({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    reply.send({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
}