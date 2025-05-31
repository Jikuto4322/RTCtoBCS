import request from 'supertest';
import { app } from '../src/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

jest.setTimeout(20000);

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
    if (fastifyApp && typeof fastifyApp.close === 'function') {
      await fastifyApp.close();
    }
  });

  test('should reject unauthenticated websocket connection', async () => {
    // This assumes your /ws endpoint requires JWT in query or headers
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
    // You may need to create a conversation first, or use a seeded one
    const conversationId = 'test-convo'; // Replace with a valid ID if needed
    const res = await request(fastifyApp.server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId,
        content: 'Hello world!',
        contentType: 'TEXT', // If your schema requires it
      })
      .expect(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.content).toBe('Hello world!');
  });

  test('should mark messages as read', async () => {
    // Replace with a valid conversation/message ID as needed
    const conversationId = 'test-convo';
    const res = await request(fastifyApp.server)
      .post(`/api/conversations/${conversationId}/read`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('success');
  });

  test('should return presence info', async () => {
    const res = await request(fastifyApp.server)
      .get('/api/presence')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});