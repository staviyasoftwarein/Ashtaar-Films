import { publicUrl } from './supabase';

export type TestimonialMediaKind = 'image' | 'video';

export type Testimonial = {
  id: string;        // stable slot id "1".."6" (also used to derive bucket filename)
  quote: string;
  author: string;
  role: string;
  /** Bucket path inside 'media' (e.g. "testimonials/avatar_1.jpeg"), legacy "/file" path, or external URL. */
  avatarPath: string;
  /** Bucket path inside 'media' (e.g. "testimonials/Testimonial_1.mp4"), legacy "/file" path, or external URL. */
  mediaPath: string;
  mediaKind: TestimonialMediaKind;
};

export type TestimonialsConfig = {
  items: Testimonial[];
};

export const DEFAULT_TESTIMONIALS: TestimonialsConfig = {
  items: [
    { id: '1', quote: "They brought our cinematic vision to life with zero compromise. The process was as artistic as the result.", author: "Elena Vance",     role: "Production Lead, Aether Studios", avatarPath: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80", mediaPath: "/TestiVideo1.mp4",  mediaKind: "video" },
    { id: '2', quote: "ASHTAAR doesn't just film; they capture the soul of the narrative. A truly world-class experience.",        author: "Marcus Thorne",   role: "Creative Director",               avatarPath: "/Testimonial1.jpeg",                                                                       mediaPath: "/Testimonial1.jpeg", mediaKind: "image" },
    { id: '3', quote: "A seamless, breathtaking production process from day one. Their attention to detail is frightening.",       author: "Sarah Jenkins",   role: "Executive Producer",              avatarPath: "https://images.unsplash.com/photo-1492691523567-6170c81efc30?auto=format&fit=crop&w=800&q=80", mediaPath: "/TestiVideo2.mp4",  mediaKind: "video" },
    { id: '4', quote: "The visual fidelity they achieved exceeded our wildest expectations. Pure cinematic magic.",                author: "David Chen",      role: "Independent Filmmaker",           avatarPath: "/Testimonial2.jpeg",                                                                       mediaPath: "/Testimonial2.jpeg", mediaKind: "image" },
    { id: '5', quote: "The final cut was an absolute masterpiece. They understood the rhythm of our story perfectly.",             author: "Julian Ross",     role: "Showrunner",                      avatarPath: "https://images.unsplash.com/photo-1533619043845-dfc67753b820?auto=format&fit=crop&w=800&q=80", mediaPath: "/TestiVideo3.mp4",  mediaKind: "video" },
    { id: '6', quote: "Innovation meets tradition. ASHTAAR is the future of digital storytelling.",                                author: "Aria Montgomery", role: "Marketing Head",                  avatarPath: "/Testimonial3.jpeg",                                                                       mediaPath: "/Testimonial3.jpeg", mediaKind: "image" },
  ],
};

/** Resolve a stored path to a usable URL.
 *  - Empty           → empty string
 *  - http(s)://...   → return as-is (external CDN)
 *  - /file           → legacy public/ asset (Vite serves it)
 *  - other           → treat as 'media' bucket path */
export function resolveTestimonialMediaUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path;
  return publicUrl('media', path);
}
