/**
 * Lightweight, zero-dependency in-memory client-side cache and prefetching engine.
 * Implements the Stale-While-Revalidate (SWR) pattern to achieve instantaneous (<10ms)
 * tab transitions without full-page loading spinners.
 */

const memoryCache = new Map();
const inFlightRequests = new Map();

const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds fresh window

const isClient = typeof window !== "undefined" || process.env.NODE_ENV === "test";

export function getCached(key) {
  if (!isClient) return null;
  const entry = memoryCache.get(key);
  if (!entry) return null;
  return entry.data;
}

export function isCacheStale(key, maxAgeMs = DEFAULT_TTL_MS) {
  if (!isClient) return true;
  const entry = memoryCache.get(key);
  if (!entry) return true;
  return Date.now() - entry.timestamp > maxAgeMs;
}

export function setCached(key, data) {
  if (!isClient) return;
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(prefix = null) {
  if (!isClient) return;
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Prefetches a URL into the memory cache.
 * Deduplicates in-flight network requests so duplicate hovers or triggers
 * do not cause multiple network calls.
 */
export async function prefetchData(url) {
  if (typeof window === "undefined" || !url) return null;

  // If already fresh in cache (within 30 seconds), skip network call
  if (!isCacheStale(url, 30 * 1000)) {
    return memoryCache.get(url)?.data;
  }

  // Deduplicate concurrent in-flight requests
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }

  const promise = fetch(url)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) {
        setCached(url, data);
      }
      return data;
    })
    .catch((err) => {
      console.debug("Prefetch failed for:", url, err);
      return null;
    })
    .finally(() => {
      inFlightRequests.delete(url);
    });

  inFlightRequests.set(url, promise);
  return promise;
}
