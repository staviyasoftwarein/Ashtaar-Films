type CachedAsset = {
  url: string;
  kind: 'image' | 'video' | 'audio' | 'other';
  alt: string | null;
};

const cache = new Map<string, CachedAsset>();

export const preloadCache = {
  get(key: string) {
    return cache.get(key);
  },
  set(key: string, value: CachedAsset) {
    cache.set(key, value);
  },
  has(key: string) {
    return cache.has(key);
  },
};
