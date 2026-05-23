import { useEffect, useState } from 'react';
import { supabase, publicUrl } from '../lib/supabase';
import { preloadCache } from '../lib/preloadCache';
import { PRELOAD_MANIFEST } from '../lib/preloadManifest';

type AssetRow = {
  key: string;
  bucket: string;
  path: string;
  kind: 'image' | 'video' | 'audio' | 'other';
  alt: string | null;
};

type State = {
  progress: number;
  loaded: boolean;
  error: Error | null;
};

const PRELOAD_TIMEOUT_MS = 20_000;

async function fetchWithProgress(
  url: string,
  totalHint: number,
  onBytes: (delta: number) => void,
  signal: AbortSignal
): Promise<{ blob: Blob; mime: string }> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  const mime = res.headers.get('Content-Type') ?? 'application/octet-stream';
  const total = Number(res.headers.get('Content-Length') ?? totalHint) || 0;

  if (!res.body) {
    const blob = await res.blob();
    onBytes(total || blob.size);
    return { blob, mime };
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      onBytes(value.length);
    }
  }
  return { blob: new Blob(chunks, { type: mime }), mime };
}

export function usePreloadAssets(): State {
  const [state, setState] = useState<State>({
    progress: 0,
    loaded: false,
    error: null,
  });

  useEffect(() => {
    if (PRELOAD_MANIFEST.length === 0) {
      setState({ progress: 100, loaded: true, error: null });
      return;
    }

    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), PRELOAD_TIMEOUT_MS);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('key,bucket,path,kind,alt')
          .in('key', PRELOAD_MANIFEST);

        if (error) throw error;
        const rows = (data ?? []) as AssetRow[];

        if (rows.length === 0) {
          setState({ progress: 100, loaded: true, error: null });
          return;
        }

        const items = rows.map((r) => ({ row: r, url: publicUrl(r.bucket, r.path) }));

        const sizes = await Promise.all(
          items.map(async (it) => {
            try {
              const h = await fetch(it.url, { method: 'HEAD', signal: ctrl.signal });
              return Number(h.headers.get('Content-Length') ?? 0);
            } catch {
              return 0;
            }
          })
        );

        const totalBytes = sizes.reduce((a, b) => a + b, 0);
        const loadedBytes = new Array(items.length).fill(0);
        const completedFlags = new Array(items.length).fill(false);

        const tick = () => {
          if (totalBytes > 0) {
            const sum = loadedBytes.reduce((a, b) => a + b, 0);
            const pct = Math.min(99, Math.floor((sum / totalBytes) * 100));
            setState((s) => ({ ...s, progress: Math.max(s.progress, pct) }));
          } else {
            const done = completedFlags.filter(Boolean).length;
            const pct = Math.min(99, Math.floor((done / items.length) * 100));
            setState((s) => ({ ...s, progress: Math.max(s.progress, pct) }));
          }
        };

        await Promise.all(
          items.map(async (it, i) => {
            const { blob, mime } = await fetchWithProgress(
              it.url,
              sizes[i],
              (delta) => {
                loadedBytes[i] += delta;
                tick();
              },
              ctrl.signal
            );
            const objectUrl = URL.createObjectURL(blob);
            preloadCache.set(it.row.key, {
              url: objectUrl,
              kind: it.row.kind,
              alt: it.row.alt,
            });
            completedFlags[i] = true;
            if (totalBytes === 0) tick();
            void mime;
          })
        );

        setState({ progress: 100, loaded: true, error: null });
      } catch (err) {
        // Don't block the site forever on a Supabase outage; let components
        // fall back to their local URLs via useAsset's fallback path.
        setState({
          progress: 100,
          loaded: true,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      clearTimeout(timeoutId);
      ctrl.abort();
    };
  }, []);

  return state;
}
