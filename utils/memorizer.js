function memoize(fn, {
  maxSize = Infinity,
  maxAge = 1000 * 60 * 60 * 24 * 90,
  evictionPolicy = 'LRU',
  customEvictFn = null
} = {}) {
  const cache = new Map();
  const usageFrequency = new Map();

  function getKey(args) {
    return JSON.stringify(args);
  }

  function evict() {
    if (evictionPolicy === 'LRU') {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
      usageFrequency.delete(oldestKey);
    } else if (evictionPolicy === 'LFU') {
      let leastUsedKey = null;
      let minFreq = Infinity;
      for (const [key, freq] of usageFrequency.entries()) {
        if (freq < minFreq) {
          leastUsedKey = key;
          minFreq = freq;
        }
      }
      if (leastUsedKey !== null) {
        cache.delete(leastUsedKey);
        usageFrequency.delete(leastUsedKey);
      }
    } else if (typeof customEvictFn === 'function') {
      customEvictFn(cache, usageFrequency);
    }
  }

  function cleanupExpired() {
    const now = Date.now();
    for (const [key, { timestamp }] of cache.entries()) {
      if (now - timestamp > maxAge) {
        cache.delete(key);
        usageFrequency.delete(key);
      }
    }
  }

  return function (...args) {
    cleanupExpired();

    const key = getKey(args);
    if (cache.has(key)) {
      usageFrequency.set(key, (usageFrequency.get(key) || 0) + 1);
      return cache.get(key).value;
    }

    const result = fn(...args);
    if (cache.size >= maxSize) {
      evict();
    }

    cache.set(key, { value: result, timestamp: Date.now() });
    usageFrequency.set(key, 1);
    return result;
  };
}

module.exports = { memoize };