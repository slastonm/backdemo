function memoize(
  fn,
  {
    maxSize = Infinity,
    maxAge = 1000 * 60 * 60 * 24 * 90,
    evictionPolicy = "LRU",
    customEvictFn = null,
    cleanupInterval = 1000 * 60 * 5,
  } = {}
) {
  const cache = new Map();

  const usageFrequency = new Map();
  class LRUNode {
    constructor(key, value = null) {
      this.key = key;
      this.value = value;
      this.prev = null;
      this.next = null;
    }
  }

  const lruHead = new LRUNode("head");
  const lruTail = new LRUNode("tail");
  lruHead.next = lruTail;
  lruTail.prev = lruHead;
  const lruNodeMap = new Map();

  function addToHead(node) {
    node.prev = lruHead;
    node.next = lruHead.next;
    lruHead.next.prev = node;
    lruHead.next = node;
  }

  function removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  function moveToHead(node) {
    removeNode(node);
    addToHead(node);
  }

  function removeTail() {
    const lastNode = lruTail.prev;
    removeNode(lastNode);
    return lastNode;
  }

  function getKey(args) {
    try {
      return JSON.stringify(args);
    } catch (error) {
      return args.map((arg, index) => `${index}:${String(arg)}`).join("|");
    }
  }
  function evict() {
    if (cache.size === 0) return;

    if (evictionPolicy === "LRU") {
      const lruNode = removeTail();
      const keyToRemove = lruNode.key;
      cache.delete(keyToRemove);
      lruNodeMap.delete(keyToRemove);
      usageFrequency.delete(keyToRemove);
    } else if (evictionPolicy === "LFU") {
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
        if (lruNodeMap.has(leastUsedKey)) {
          removeNode(lruNodeMap.get(leastUsedKey));
          lruNodeMap.delete(leastUsedKey);
        }
      }
    } else if (typeof customEvictFn === "function") {
      customEvictFn(cache, usageFrequency);
    }
  }

  function cleanupExpired() {
    if (maxAge === Infinity) return;

    const now = Date.now();
    const keysToDelete = [];

    for (const [key, { timestamp }] of cache.entries()) {
      if (now - timestamp > maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      cache.delete(key);
      usageFrequency.delete(key);
      if (lruNodeMap.has(key)) {
        removeNode(lruNodeMap.get(key));
        lruNodeMap.delete(key);
      }
    });
  }

  let cleanupTimer = null;
  if (maxAge !== Infinity && cleanupInterval > 0) {
    cleanupTimer = setInterval(cleanupExpired, cleanupInterval);
  }

  const memoizedFn = function (...args) {
    const key = getKey(args);

    if (cache.has(key)) {
      const cacheEntry = cache.get(key);

      if (maxAge !== Infinity && Date.now() - cacheEntry.timestamp > maxAge) {
        cache.delete(key);
        usageFrequency.delete(key);
        if (lruNodeMap.has(key)) {
          removeNode(lruNodeMap.get(key));
          lruNodeMap.delete(key);
        }
      } else {
        usageFrequency.set(key, (usageFrequency.get(key) || 0) + 1);

        if (evictionPolicy === "LRU" && lruNodeMap.has(key)) {
          moveToHead(lruNodeMap.get(key));
        }

        return cacheEntry.value;
      }
    }

    const result = fn(...args);

    if (cache.size >= maxSize) {
      evict();
    }

    const timestamp = Date.now();
    cache.set(key, { value: result, timestamp });
    usageFrequency.set(key, 1);

    if (evictionPolicy === "LRU") {
      const newNode = new LRUNode(key);
      addToHead(newNode);
      lruNodeMap.set(key, newNode);
    }

    return result;
  };

  memoizedFn.cache = {
    clear() {
      cache.clear();
      usageFrequency.clear();
      lruNodeMap.clear();
      lruHead.next = lruTail;
      lruTail.prev = lruHead;
    },

    size() {
      return cache.size;
    },
    has(args) {
      const key = getKey(args);
      return cache.has(key);
    },

    // Видалити конкретний ключ
    delete(args) {
      const key = getKey(args);
      const deleted = cache.delete(key);
      if (deleted) {
        usageFrequency.delete(key);
        if (lruNodeMap.has(key)) {
          removeNode(lruNodeMap.get(key));
          lruNodeMap.delete(key);
        }
      }
      return deleted;
    },

    // Отримати статистику кешу
    stats() {
      const now = Date.now();
      const expired = [];
      const active = [];

      for (const [key, { timestamp }] of cache.entries()) {
        if (maxAge !== Infinity && now - timestamp > maxAge) {
          expired.push(key);
        } else {
          active.push(key);
        }
      }

      return {
        totalEntries: cache.size,
        activeEntries: active.length,
        expiredEntries: expired.length,
        maxSize,
        maxAge,
        evictionPolicy,
      };
    },

    // Ручна очистка застарілих елементів
    cleanup: cleanupExpired,
  };

  if (typeof process !== "undefined" && process.on) {
    process.on("exit", () => {
      if (cleanupTimer) {
        clearInterval(cleanupTimer);
      }
    });
  }

  return memoizedFn;
}

module.exports = { memoize };
