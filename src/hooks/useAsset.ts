import { useEffect, useState } from 'react';
import { supabase, publicUrl } from '../lib/supabase';
import { preloadCache } from '../lib/preloadCache';

type AssetRow = {
  key: string;
  bucket: string;
  path: string;
  kind: 'image' | 'video' | 'audio' | 'other';
  alt: string | null;
};

type UseAssetResult = {
  url: string | null;
  alt: string | null;
  kind: AssetRow['kind'] | null;
  loading: boolean;
  error: Error | null;
};

const cache = new Map<string, UseAssetResult>();

export function useAsset(key: string, fallbackUrl?: string): UseAssetResult {
  const [state, setState] = useState<UseAssetResult>(() => {
    const preloaded = preloadCache.get(key);
    if (preloaded) {
      return {
        url: preloaded.url,
        alt: preloaded.alt,
        kind: preloaded.kind,
        loading: false,
        error: null,
      };
    }
    return (
      cache.get(key) ?? {
        url: fallbackUrl ?? null,
        alt: null,
        kind: null,
        loading: true,
        error: null,
      }
    );
  });

  useEffect(() => {
    if (preloadCache.has(key)) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('key,bucket,path,kind,alt')
        .eq('key', key)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        const next: UseAssetResult = {
          url: fallbackUrl ?? null,
          alt: null,
          kind: null,
          loading: false,
          error: error ?? null,
        };
        cache.set(key, next);
        setState(next);
        return;
      }

      const row = data as AssetRow;
      const next: UseAssetResult = {
        url: publicUrl(row.bucket, row.path),
        alt: row.alt,
        kind: row.kind,
        loading: false,
        error: null,
      };
      cache.set(key, next);
      setState(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [key, fallbackUrl]);

  return state;
}
