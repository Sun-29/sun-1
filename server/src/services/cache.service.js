const { redisClient: redis } = require('../config/redis');
const config = require('../config');

class CacheService {
  constructor() {
    this.prefix = 'ai:interview:';
    this.defaultTTL = 3600;
  }

  _key(k) { return this.prefix + k; }

  async get(key) {
    if (!redis || redis.status !== 'ready') return null;
    try {
      const val = await redis.get(this._key(key));
      return val ? JSON.parse(val) : null;
    } catch (e) { return null; }
  }

  async set(key, value, ttl = this.defaultTTL) {
    if (!redis || redis.status !== 'ready') return;
    try {
      await redis.set(this._key(key), JSON.stringify(value), 'EX', ttl);
    } catch (e) { /* silent */ }
  }

  async del(key) {
    if (!redis || redis.status !== 'ready') return;
    try { await redis.del(this._key(key)); } catch (e) { /* silent */ }
  }

  async delByPattern(pattern) {
    if (!redis || redis.status !== 'ready') return;
    try {
      const keys = await redis.keys(this._key(pattern));
      if (keys.length > 0) await redis.del(...keys);
    } catch (e) { /* silent */ }
  }

  async getOrSet(key, ttl, fetchFn) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  async clearUserCache(userId) {
    await this.delByPattern(`user:${userId}:*`);
  }

  async cachePositions(positions) {
    await this.set('positions:all', positions, 1800);
  }

  async getCachedPositions() {
    return this.get('positions:all');
  }
}

module.exports = new CacheService();
