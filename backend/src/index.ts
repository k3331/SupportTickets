/**
 * Server entry point. Connects to MongoDB then starts Express.
 */

import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 3001;

async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Support Tickets API running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
