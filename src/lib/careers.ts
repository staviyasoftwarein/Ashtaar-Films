import { publicUrl } from './supabase';

export type CareerRole = {
  id: string;        // stable id (1..MAX_ROLES) — used to derive bucket filename
  active: boolean;   // only active roles render on the public site
  dept: string;
  title: string;
  quote: string;
  /** Bucket path inside 'media' (e.g. "careers/career1.jpeg"), legacy "/file" path, or external URL. */
  imagePath: string;
};

export type CareersConfig = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;     // rendered in gold
  description: string;
  roles: CareerRole[];
};

export const MAX_CAREER_ROLES = 30;

export const DEFAULT_CAREERS: CareersConfig = {
  eyebrow: 'Join The Cult',
  titleLine1: "We don't hire employees.",
  titleLine2: 'We recruit fanatics.',
  description: "If you're looking for a comfortable 9-to-5, close this tab. We are looking for the obsessed, the detail-oriented, and the relentlessly creative. Leave your ego at the door. Let your work speak. This is not a workplace. It is a forge.",
  roles: [
    { id: '1',  active: true, dept: 'Direction',       title: 'Director',                  quote: 'Vision is the art of seeing what is invisible to others.',          imagePath: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80' },
    { id: '2',  active: true, dept: 'Direction',       title: 'Assistant Director',        quote: 'Chaos management disguised as scheduling.',                          imagePath: 'https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&w=1920&q=80' },
    { id: '3',  active: true, dept: 'Production',      title: 'Producer',                  quote: 'Making the impossible happen, on schedule and under budget.',        imagePath: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1920&q=80' },
    { id: '4',  active: true, dept: 'Camera',          title: 'Cinematographer (DOP)',     quote: 'Painting with light and shadow.',                                    imagePath: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1920&q=80' },
    { id: '5',  active: true, dept: 'Story',           title: 'Script Writer',             quote: 'The blank page is the ultimate canvas.',                             imagePath: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&w=1920&q=80' },
    { id: '6',  active: true, dept: 'Post-Production', title: 'Video Editor',              quote: 'Sculpting time and emotion in the cutting room.',                    imagePath: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4ce44?auto=format&fit=crop&w=1920&q=80' },
    { id: '7',  active: true, dept: 'Audio',           title: 'Sound Designer',            quote: 'Hearing is feeling. We design the heartbeat.',                       imagePath: 'https://images.unsplash.com/photo-1598488035139-27a3c360df91?auto=format&fit=crop&w=1920&q=80' },
    { id: '8',  active: true, dept: 'Production',      title: 'Production Manager',        quote: 'The architectural backbone of every rolling camera.',                imagePath: 'https://images.unsplash.com/photo-1498622205843-ea3ce4f52f4c?auto=format&fit=crop&w=1920&q=80' },
    { id: '9',  active: true, dept: 'Talent',          title: 'Casting Director',          quote: 'Discovering the faces that will define the film.',                   imagePath: 'https://images.unsplash.com/photo-1455894127589-22f75500213a?auto=format&fit=crop&w=1920&q=80' },
    { id: '10', active: true, dept: 'Post-Production', title: 'VFX Artist',                quote: 'Where imagination dictates physical reality.',                       imagePath: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80' },
    { id: '11', active: true, dept: 'Design',          title: 'Motion Graphics Designer',  quote: 'Breathing kinetic energy into static pixels.',                       imagePath: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1920&q=80' },
    { id: '12', active: true, dept: 'Production',      title: 'Production Assistant',      quote: 'The glue handling a thousand invisible miracles.',                   imagePath: 'https://images.unsplash.com/photo-1601506521937-01362e361d7b?auto=format&fit=crop&w=1920&q=80' },
    { id: '13', active: true, dept: 'Creative',        title: 'Art Director',              quote: 'Building worlds from the ground up.',                                imagePath: 'https://images.unsplash.com/photo-1498036882173-b41c28af5c1b?auto=format&fit=crop&w=1920&q=80' },
    { id: '14', active: true, dept: 'Art Dept',        title: 'Costume Designer',          quote: 'Telling stories through fabric and thread.',                         imagePath: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=1920&q=80' },
    { id: '15', active: true, dept: 'Marketing',       title: 'Social Media Manager',      quote: 'Translating cinematic epics into digital pulses.',                   imagePath: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1920&q=80' },
    { id: '16', active: true, dept: 'Marketing',       title: 'Marketing Executive',       quote: 'Engineering the global anticipation of modern myth.',                imagePath: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1920&q=80' },
  ],
};

export function resolveCareerImageUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path;
  return publicUrl('media', path);
}

/** Find the lowest unused id in 1..MAX_CAREER_ROLES (returns "" if all are taken). */
export function nextRoleId(roles: CareerRole[]): string {
  const used = new Set(roles.map((r) => r.id));
  for (let i = 1; i <= MAX_CAREER_ROLES; i++) {
    if (!used.has(String(i))) return String(i);
  }
  return '';
}
