const Redis = require('ioredis');
const config = require('./index');

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected successfully.');
});

redisClient.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redisClient.on('reconnecting', () => {
  console.log('[Redis] Reconnecting...');
});

redisClient.on('close', () => {
  console.log('[Redis] Connection closed.');
});

async function connectRedis() {
  try {
    if (config.redis.password || config.nodeEnv === 'production') {
      await redisClient.connect();
    }
    return redisClient;
  } catch (error) {
    console.warn('[Redis] Connection failed, running without cache:', error.message);
    return null;
  }
}

module.exports = { redisClient, connectRedis };
