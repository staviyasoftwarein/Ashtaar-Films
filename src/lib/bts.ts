import { publicUrl } from './supabase';

export type BtsImage = {
  id: string;        // stable slot "1".."15" — used to derive bucket filename
  imagePath: string; // bucket path (e.g. "bts/bts1.jpeg"), legacy "/file", or external URL
};

/** Max images allowed in the BTS gallery. */
export const BTS_MAX_IMAGES = 15;

/** Lowest unused id (1..). Reuses freed slots so bucket names stay compact. */
export function nextBtsId(images: BtsImage[]): string {
  const used = new Set(images.map((img) => img.id));
  let i = 1;
  while (used.has(String(i))) i++;
  return String(i);
}

export type BtsConfig = {
  eyebrow: string;
  title: string;
  images: BtsImage[];
};

export const DEFAULT_BTS: BtsConfig = {
  eyebrow: 'Behind The Scenes',
  title: 'Vision beyond the lens.',
  images: [
    { id: '1', imagePath: '/bts1.jpg' },
    { id: '2', imagePath: '/bts2.jpg' },
    { id: '3', imagePath: '/bts3.jpg' },
    { id: '4', imagePath: '/bts4.jpg' },
    { id: '5', imagePath: '/bts5.jpg' },
    { id: '6', imagePath: '/bts6.jpg' },
    { id: '7', imagePath: '/bts7.jpg' },
    { id: '8', imagePath: '/bts8.jpg' },
  ],
};

export function resolveBtsImageUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path;
  return publicUrl('media', path);
}
