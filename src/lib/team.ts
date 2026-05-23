import { publicUrl } from './supabase';

export type TeamMember = {
  id: string;        // stable slot id (1, 2, …) — also used for the bucket filename
  name: string;
  role: string;
  /** Bucket path inside 'media' (e.g. "team/imp_person1.jpeg"), legacy "/file" path, or external URL. */
  imagePath: string;
};

export type TeamConfig = {
  eyebrow: string;
  title: string;
  members: TeamMember[];
};

export const DEFAULT_TEAM: TeamConfig = {
  eyebrow: 'The Visionaries',
  title: 'Faces Behind The Lens',
  members: [
    { id: '1', name: 'Chinmay Naik', role: 'Director', imagePath: '/Director.jpeg' },
    { id: '2', name: 'Viraj Dave',   role: 'Producer', imagePath: '/Producer.jpeg' },
  ],
};

export function resolveTeamImageUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path;
  return publicUrl('media', path);
}
