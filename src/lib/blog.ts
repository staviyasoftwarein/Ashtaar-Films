import { publicUrl } from './supabase';

export type BlogMediaKind = 'image' | 'video';

export type BlogPost = {
  id: string;
  title: string;
  category: string;
  /** ISO date "YYYY-MM-DD" — formatted for display via formatBlogDate(). */
  date: string;
  comments: number;
  excerpt: string;     // shown on the public card + in the modal list
  content: string;     // shown inside the modal when a post is opened
  /** Bucket path inside 'media' (e.g. "blog/post_1.jpeg"), legacy "/file" path, or external URL. Empty = no media. */
  mediaPath: string;
  mediaKind: BlogMediaKind;
};

/** Resolve a stored path to a usable URL.
 *  - Empty           → empty string
 *  - http(s)://...   → return as-is (external CDN)
 *  - /file           → legacy public/ asset (Vite serves it)
 *  - other           → treat as 'media' bucket path */
export function resolveBlogMediaUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path;
  return publicUrl('media', path);
}

/** Today's date as "YYYY-MM-DD" in the local timezone (matches what
 *  an <input type="date"> picker expects and produces). */
export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Normalize any stored date string to ISO "YYYY-MM-DD" so it can bind to
 *  <input type="date">. Accepts ISO already, or formats like
 *  "December 05, 2025" / "Dec 5, 2025" / "2025/12/05". Returns "" if unparseable. */
export function toIsoDate(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const dt = new Date(trimmed);
  if (Number.isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "2026-05-10" → "May 10, 2026". Falls back to the raw value for
 *  legacy free-form dates that don't parse cleanly. */
export function formatBlogDate(value: string): string {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return value;
  const [, y, mo, d] = m;
  // Build the date in UTC so it can't slip a day in negative-offset timezones.
  const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
}

export type BlogConfig = {
  posts: BlogPost[];
};

export const DEFAULT_BLOG: BlogConfig = {
  posts: [
    {
      id: '1',
      title: 'The Vision Behind Ashtaar Films: Redefining Regional Cinema',
      category: 'Vision',
      date: '2026-05-10',
      comments: 42,
      excerpt: 'Exploring our founding philosophy and how Ashtaar Films aims to bring authentic regional stories to the global stage...',
      content: "The world of cinema is constantly evolving, yet the core principles of storytelling remain eternal. In this piece, we explore the intricate balance between technical mastery and emotional resonance. Our approach at Ashtaar Films is rooted in a deep understanding of human experience, translated through the meticulous craft of filmmaking. Every frame is a deliberate choice, every sound carefully orchestrated to immerse the audience in a reality that is both constructed and profoundly authentic. We believe that true cinematic art doesn't just show a story; it makes you feel it in your bones.",
      mediaPath: '',
      mediaKind: 'image',
    },
    {
      id: '2',
      title: 'On Set with Ashtaar: The Making of Our Latest Masterpiece',
      category: 'Production',
      date: '2026-04-22',
      comments: 18,
      excerpt: 'A deep dive into the rigorous production process and collaborative spirit that define an Ashtaar Films set...',
      content: "The world of cinema is constantly evolving, yet the core principles of storytelling remain eternal. In this piece, we explore the intricate balance between technical mastery and emotional resonance. Our approach at Ashtaar Films is rooted in a deep understanding of human experience, translated through the meticulous craft of filmmaking. Every frame is a deliberate choice, every sound carefully orchestrated to immerse the audience in a reality that is both constructed and profoundly authentic. We believe that true cinematic art doesn't just show a story; it makes you feel it in your bones.",
      mediaPath: '',
      mediaKind: 'image',
    },
    {
      id: '3',
      title: "Empowering Local Voices: Ashtaar's Emerging Directors Program",
      category: 'Community',
      date: '2026-03-15',
      comments: 34,
      excerpt: 'How we are discovering, funding, and supporting the next generation of visionary storytellers from the region...',
      content: "The world of cinema is constantly evolving, yet the core principles of storytelling remain eternal. In this piece, we explore the intricate balance between technical mastery and emotional resonance. Our approach at Ashtaar Films is rooted in a deep understanding of human experience, translated through the meticulous craft of filmmaking. Every frame is a deliberate choice, every sound carefully orchestrated to immerse the audience in a reality that is both constructed and profoundly authentic. We believe that true cinematic art doesn't just show a story; it makes you feel it in your bones.",
      mediaPath: '',
      mediaKind: 'image',
    },
    {
      id: '4',
      title: 'The Sound of Silence: Sound Design in Our Thrillers',
      category: 'Technical',
      date: '2026-02-28',
      comments: 21,
      excerpt: 'Exploring the psychological impact of audio and silence in modern thriller filmmaking...',
      content: "Sound design is often the unsung hero of a compelling thriller. It's not just about loud noises or jump scares; it's about the tension created by what you don't hear. The deliberate absence of sound—the silence—can be more terrifying than the most dramatic orchestral swell. In our recent productions, we've focused on utilizing silence as a narrative tool, forcing the audience to lean into the quiet moments, heightening their senses and making the eventual auditory impact that much more visceral.",
      mediaPath: '',
      mediaKind: 'image',
    },
    {
      id: '5',
      title: 'From Page to Screen: Our Script Development Process',
      category: 'Writing',
      date: '2026-01-14',
      comments: 15,
      excerpt: 'The journey of a story from the first draft to the final shooting script...',
      content: "A script is a living document, a blueprint for a world that does not yet exist. Our script development process is rigorous, collaborative, and entirely driven by character. We don't just write dialogue; we sculpt subtext. From the initial outlining phase to the countless revisions and table reads, every word is tested for authenticity and dramatic weight. We believe that the foundation of any great film is a script that is so solid, it allows the director and actors the freedom to truly soar.",
      mediaPath: '',
      mediaKind: 'image',
    },
    {
      id: '6',
      title: 'Lighting the Shadows: A Cinematography Deep Dive',
      category: 'Masterclass',
      date: '2025-12-05',
      comments: 56,
      excerpt: 'Breaking down the intricate lighting setups from our most visually striking scenes...',
      content: "Cinematography is painting with light, but it's equally about mastering the shadows. The absence of light defines depth, mood, and mystery. In this deep dive, we explore how our cinematographers use shadow to conceal and reveal, guiding the viewer's eye and manipulating their emotional response. We examine specific setups from our films, analyzing the placement of every fixture and flag, to demonstrate how a nuanced approach to lighting can elevate a scene from standard coverage to true cinematic art.",
      mediaPath: '',
      mediaKind: 'image',
    },
  ],
};

/** Lowest unused id (1..MAX). Returns the next sequential id if none reused. */
export function nextBlogId(posts: BlogPost[]): string {
  const used = new Set(posts.map((p) => p.id));
  let i = 1;
  while (used.has(String(i))) i++;
  return String(i);
}
