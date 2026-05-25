/* Types + defaults + YouTube helpers for the Portfolio section. */

import { publicUrl } from './supabase';

export type Slide1 = {
  num: string;
  title: string;
  subtitle: string;
  description: string;
  youtubeId: string;
};

export type VfxTab = {
  id: string;
  tag: string;
  subtitle: string;
  description: string;
  youtubeId: string;
  /** Optional: path inside the 'media' Supabase bucket (e.g. "portfolio/slide2-anime-...jpg").
   *  Used when youtubeId is empty. If both are empty, the public site shows a "coming soon" panel. */
  imagePath?: string;
};

export type Slide2 = {
  num: string;
  title: string;
  tabs: VfxTab[];
};

export type MusicTrack = {
  youtubeId: string;
  title: string;
  artist: string;
  time: string;
};

export type Slide3 = {
  num: string;
  title: string;
  subtitle: string;
  playlistUrl: string;
  tracks: MusicTrack[];
};

export type Slide4 = {
  num: string;
  title: string;
  subtitle: string;
  description: string;
  youtubeId: string;
};

export type PortfolioConfig = {
  slide1: Slide1;
  slide2: Slide2;
  slide3: Slide3;
  slide4: Slide4;
};

export const DEFAULT_PORTFOLIO: PortfolioConfig = {
  slide1: {
    num: '01',
    title: 'Theatrical Release',
    subtitle: 'DUSSEHRA',
    description:
      'An epic cinematic journey captured flawlessly. A visual masterpiece that redefines storytelling for the modern era. Experience the intensity and grandeur of our latest theatrical release.',
    youtubeId: 'oJ2SpQQdzJE',
  },
  slide2: {
    num: '02',
    title: 'Visual Effects',
    tabs: [
      {
        id: 'vfx',
        tag: 'VFX Production',
        subtitle: 'DEFYING REALITY',
        description:
          'Industry-leading composite structures and CGI pipelines. We manipulate reality at the pixel level to build environments that defy physics.',
        youtubeId: 'TB5TRy8MO48',
      },
      {
        id: 'anime',
        tag: 'Anime 2D/3D',
        subtitle: 'BOUNDLESS WORLDS',
        description:
          'Striking cel-shaded aesthetics blending traditional art with next-gen rigging. Bringing vibrant, culturally rich stories to life.',
        youtubeId: '',
      },
    ],
  },
  slide3: {
    num: '03',
    title: 'Music Production',
    subtitle: 'Custom Scores',
    playlistUrl: 'https://www.youtube.com/@AshtaarFilms/playlists',
    tracks: [
      { youtubeId: '3NEVXvl9its', title: 'Ashtaar Original - Track 1', artist: 'Ashtaar Music Production', time: '3:42' },
      { youtubeId: 'pRavDqOEXHw', title: 'Ashtaar Original - Track 2', artist: 'Ashtaar Music Production', time: '4:15' },
      { youtubeId: 'uJCY9donaQs', title: 'Ashtaar Original - Track 3', artist: 'Ashtaar Music Production', time: '2:58' },
      { youtubeId: 'WtokpA6O9s4', title: 'Ashtaar Original - Track 4', artist: 'Ashtaar Music Production', time: '5:12' },
    ],
  },
  slide4: {
    num: '04',
    title: 'AI Animation',
    subtitle: 'Advanced Tech',
    description:
      'Harnessing generative latent diffusion and custom computational pipelines. We synthesize impossible visual architectures to pioneer the absolute cutting edge of digital storytelling.',
    youtubeId: 'CQiuxa2T9Ts',
  },
};

/* ─── YouTube helpers ─────────────────────────────────── */
const YT_PATTERNS: RegExp[] = [
  /youtu\.be\/([\w-]{11})/i,
  /youtube\.com\/embed\/([\w-]{11})/i,
  /youtube\.com\/v\/([\w-]{11})/i,
  /youtube\.com\/shorts\/([\w-]{11})/i,
  /[?&]v=([\w-]{11})/i,
];

export function parseYouTubeId(input: string): string {
  const t = (input ?? '').trim();
  if (!t) return '';
  if (/^[\w-]{11}$/.test(t)) return t;
  for (const re of YT_PATTERNS) {
    const m = t.match(re);
    if (m && m[1]) return m[1];
  }
  return '';
}

export function ytThumb(id: string, quality: 'mq' | 'hq' | 'max' = 'mq'): string {
  if (!id) return '';
  const map = { mq: 'mqdefault', hq: 'hqdefault', max: 'maxresdefault' } as const;
  return `https://img.youtube.com/vi/${id}/${map[quality]}.jpg`;
}

export function resolvePortfolioMediaUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path;
  return publicUrl('media', path);
}
