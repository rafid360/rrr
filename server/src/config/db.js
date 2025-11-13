const mongoose = require('mongoose');
let memoryServer = null;
const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectDB(uri) {
  try {
    if (uri) {
      await mongoose.connect(uri);
      console.log(`[DB] Connected to MongoDB`);
      return;
    }
    console.warn('[DB] MONGO_URI not set, falling back to in-memory MongoDB');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log('[DB] Connected to in-memory MongoDB');
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
    if (!memoryServer) {
      try {
        console.warn('[DB] Falling back to in-memory MongoDB');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log('[DB] Connected to in-memory MongoDB');
      } catch (memErr) {
        console.error('[DB] In-memory MongoDB failed:', memErr.message);
      }
    }
  }
}

module.exports = connectDB;