import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Create and export a shared Redis connection
export const redisClient = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
});
