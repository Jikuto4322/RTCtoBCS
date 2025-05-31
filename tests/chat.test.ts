import request from 'supertest';
import { app } from '../src/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

describe('Chat API', () => {
  let token: string;
  let userId = 'test-user-id';
  let fastifyApp: any;

  beforeAll(async () => {
    token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
    fastifyApp = await app;
    await fastifyApp.ready();
  });

  afterAll(async () => {
    await fastifyApp.close();
  });

  test('should reject unauthenticated websocket connection', async () => {
    const res = await request(fastifyApp.server)
      .get('/ws')
      .expect(400);
    expect(res.text).toMatch(/token/i);
  });

  test('should get conversations (REST)', async () => {
    const res = await request(fastifyApp.server)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should send a message (REST)', async () => {
    const res = await request(fastifyApp.server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: 'test-convo',
        content: 'Hello world!',
      })
      .expect(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.content).toBe('Hello world!');
  });
});