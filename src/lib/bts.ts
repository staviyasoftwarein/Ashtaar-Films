import { publicUrl } from './supabase';

export type BtsImage = {
  id: string;
  imagePath: string;
};

export const BTS_MAX_IMAGES = 15;

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
  images: [], // ✅ empty — never falls back to old horizontal images
};

export function resolveBtsImageUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path;
  return publicUrl('media', path);
}