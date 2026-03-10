/**
 * MongoDB connection using Mongoose. Retries when running in Docker until Mongo is ready.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/support-tickets';
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2000;

export async function connectDB(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES}:`, message);
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}
