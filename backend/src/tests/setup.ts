import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import config from '../app/config';

let mongoServer: MongoMemoryServer | null = null;
const USE_REAL_DB = process.env.USE_REAL_DB === 'true' || process.platform === 'win32';

export const connectDatabase = async () => {
  if (USE_REAL_DB) {
    const testDbUri = process.env.TEST_DATABASE_URL || config.database_url || 'mongodb://localhost:27017';
    const testDbName = 'filesure_test';

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri, {
        dbName: testDbName,
      });

      // Allow MongoDB snapshot to stabilize after connection
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  } else {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }
};

export const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;
  const promises = [];

  for (const key in collections) {
    promises.push(collections[key].deleteMany({}));
  }

  await Promise.all(promises);

  // Delay to allow MongoDB snapshot to stabilize after clearing collections
  // This prevents "SnapshotUnavailable" errors in rapid test execution with transactions
  await new Promise(resolve => setTimeout(resolve, 200));
};


export const closeDatabase = async () => {
  if (USE_REAL_DB) {
    try {
      await mongoose.connection.dropDatabase();
    } catch (error) {
      console.error('Error dropping test database:', error);
    }
    await mongoose.connection.close();
  } else {

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
};
