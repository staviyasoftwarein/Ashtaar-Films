import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const cache = new Map<string, unknown>();
const subscribers = new Map<string, Set<(value: unknown) => void>>();

function subscribe(key: string, fn: (value: unknown) => void) {
  if (!subscribers.has(key)) subscribers.set(key, new Set());
  subscribers.get(key)!.add(fn);
  return () => {
    subscribers.get(key)?.delete(fn);
  };
}

function emit(key: string, value: unknown) {
  cache.set(key, value);
  subscribers.get(key)?.forEach((fn) => fn(value));
}

export function useSetting<T>(key: string, fallback: T): {
  value: T;
  loading: boolean;
  error: Error | null;
  save: (next: T) => Promise<void>;
} {
  const [value, setValue] = useState<T>(() => (cache.get(key) as T | undefined) ?? fallback);
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!cache.has(key)) {
      (async () => {
        const { data, error: err } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', key)
          .maybeSingle();

        if (cancelled) return;

        if (err) {
          setError(err);
          setLoading(false);
          return;
        }
        if (data) {
          emit(key, data.value as T);
          setValue(data.value as T);
        }
        setLoading(false);
      })();
    }

    const unsub = subscribe(key, (v) => {
      if (!cancelled) setValue(v as T);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [key]);

  const save = async (next: T) => {
    const { error: err } = await supabase
      .from('site_settings')
      .upsert({ key, value: next as never }, { onConflict: 'key' });
    if (err) throw err;
    emit(key, next);
  };

  return { value, loading, error, save };
}
