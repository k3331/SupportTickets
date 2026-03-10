/**
 * Express application setup. Export app for server and tests.
 */

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ticketRoutes from './routes/ticketRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './errors/AppError.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not ready',
    mongodb: ready ? 'connected' : 'disconnected',
  });
});

app.use((_req, _res, next) => next(new AppError('Not found', 404)));
app.use(errorHandler);

export default app;
