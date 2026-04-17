// Simple In-Memory Cache Service with TTL support
class CacheService {
  constructor() {
    this.cache = new Map();
    this.TTL_MS = 60 * 1000; // 1 minute default TTL
  }

  set(key, value) {
    if (value === null || value === undefined) return;
    
    const entry = {
      data: value,
      expiry: Date.now() + this.TTL_MS
    };
    this.cache.set(key, entry);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  del(key) {
    this.cache.delete(key);
  }

  flush() {
    this.cache.clear();
  }
  
  // Namespacing helper
  generateKey(namespace, id = '') {
    return id ? `${namespace}:${id}` : `${namespace}:list`;
  }
}

module.exports = new CacheService();
