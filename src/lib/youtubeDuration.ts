/* Fetches a YouTube video's duration in the browser using the IFrame Player API.
 * No API key required — we instantiate a hidden, muted player, wait for `onReady`,
 * read `getDuration()`, then destroy the player. Results are memoized by videoId. */

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise<void>((resolve) => {
    const w = window as unknown as { YT?: { Player: unknown }; onYouTubeIframeAPIReady?: () => void };
    if (w.YT && w.YT.Player) {
      resolve();
      return;
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve();
    };

    // Safety net: if the API loaded before our callback was registered.
    const interval = window.setInterval(() => {
      if (w.YT && w.YT.Player) {
        window.clearInterval(interval);
        resolve();
      }
    }, 100);
    window.setTimeout(() => window.clearInterval(interval), 8000);
  });

  return apiLoadPromise;
}

const durationCache = new Map<string, number | null>();
const inflight = new Map<string, Promise<number | null>>();

/** Returns duration in seconds, or null if unavailable. */
export async function fetchYouTubeDuration(videoId: string): Promise<number | null> {
  if (!videoId) return null;
  if (durationCache.has(videoId)) return durationCache.get(videoId) ?? null;
  if (inflight.has(videoId)) return inflight.get(videoId)!;

  const p = (async (): Promise<number | null> => {
    try {
      await loadYouTubeIframeApi();
    } catch {
      return null;
    }

    return new Promise<number | null>((resolve) => {
      const container = document.createElement('div');
      container.style.cssText = 'position:absolute;top:-10000px;left:-10000px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
      document.body.appendChild(container);

      const playerDiv = document.createElement('div');
      container.appendChild(playerDiv);

      let settled = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let player: any = null;

      const cleanup = () => {
        try { player?.destroy?.(); } catch { /* noop */ }
        if (container.parentNode) container.parentNode.removeChild(container);
      };

      const finish = (value: number | null) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        cleanup();
        resolve(value);
      };

      const timeout = window.setTimeout(() => finish(null), 10_000);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const YT = (window as any).YT;
        player = new YT.Player(playerDiv, {
          videoId,
          height: '0',
          width: '0',
          playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onReady: (event: any) => {
              const seconds = event.target.getDuration();
              finish(typeof seconds === 'number' && seconds > 0 ? seconds : null);
            },
            onError: () => finish(null),
          },
        });
      } catch {
        finish(null);
      }
    });
  })();

  inflight.set(videoId, p);
  const result = await p;
  inflight.delete(videoId);
  durationCache.set(videoId, result);
  return result;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '';
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
