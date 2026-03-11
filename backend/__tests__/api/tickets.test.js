/**
 * API tests for ticket endpoints. Uses test DB: set MONGODB_URI to a test database.
 */

import 'dotenv/config';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../dist/src/app.js';
import { connectDB } from '../../dist/src/config/db.js';

const originalUri = process.env.MONGODB_URI;

beforeAll(async () => {
  process.env.MONGODB_URI = process.env.MONGODB_URI?.replace(/\/[^/]+$/, '/support-tickets-test') ?? 'mongodb://localhost:27017/support-tickets-test';
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
  process.env.MONGODB_URI = originalUri;
});

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /ready', () => {
  it('returns 200 and ready when DB connected', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.mongodb).toBe('connected');
  });
});

describe('POST /api/tickets', () => {
  it('creates a ticket and returns 201', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ subject: 'Test subject', message: 'Test message', priority: 'Medium' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      subject: 'Test subject',
      message: 'Test message',
      priority: 'Medium',
      status: 'NEW',
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it('returns 400 when subject is missing', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ message: 'Msg', priority: 'Low' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when priority is invalid', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ subject: 'Valid subject', message: 'Valid message here', priority: 'Invalid' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/tickets', () => {
  it('returns 200 and array of tickets', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PATCH /api/tickets/:id', () => {
  let ticketId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ subject: 'Patch test', message: 'Patch message for update test', priority: 'High' });
    expect(res.status).toBe(201);
    ticketId = res.body.id;
  });

  it('updates status and returns 200', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .send({ status: 'INVESTIGATING' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('INVESTIGATING');
  });

  it('returns 404 for invalid id', async () => {
    const res = await request(app)
      .patch('/api/tickets/000000000000000000000000')
      .send({ status: 'RESOLVED' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).patch(`/api/tickets/${ticketId}`).send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
