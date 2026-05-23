// Curated cinematic / editorial font roster for the Hero wordmark.
// All entries are loaded via Google Fonts in src/index.css.
// To add a new font: add the @import in index.css AND a row here.

export type FontStyle = 'normal' | 'italic';

export type FontDefinition = {
  family: string;
  category: 'display-serif' | 'display-sans' | 'serif' | 'sans';
  weights: number[];
  italics: boolean;
  fallback: string;
};

export const HERO_FONTS: FontDefinition[] = [
  { family: 'Abril Fatface',     category: 'display-serif', weights: [400],                          italics: false, fallback: 'serif' },
  { family: 'Playfair Display',  category: 'serif',         weights: [400,500,600,700,800,900],     italics: true,  fallback: 'serif' },
  { family: 'Cinzel',            category: 'display-serif', weights: [400,500,600,700,800,900],     italics: false, fallback: 'serif' },
  { family: 'Cormorant Garamond',category: 'serif',         weights: [400,500,600,700],             italics: true,  fallback: 'serif' },
  { family: 'Italiana',          category: 'display-serif', weights: [400],                          italics: false, fallback: 'serif' },
  { family: 'Marcellus',         category: 'serif',         weights: [400],                          italics: false, fallback: 'serif' },
  { family: 'Bebas Neue',        category: 'display-sans',  weights: [400],                          italics: false, fallback: 'sans-serif' },
  { family: 'Anton',             category: 'display-sans',  weights: [400],                          italics: false, fallback: 'sans-serif' },
  { family: 'Oswald',            category: 'display-sans',  weights: [400,500,600,700],             italics: false, fallback: 'sans-serif' },
  { family: 'Inter',             category: 'sans',          weights: [300,400,500,600,700,800,900], italics: false, fallback: 'sans-serif' },
];

export type HeroFont = {
  family: string;
  weight: number;
  style: FontStyle;
  letterSpacing: string;     // e.g. "0.02em"
  textTransform?: 'uppercase' | 'none';
};

export const DEFAULT_HERO_FONT: HeroFont = {
  family: 'Abril Fatface',
  weight: 400,
  style: 'normal',
  letterSpacing: '0em',
  textTransform: 'uppercase',
};

export function findFont(family: string): FontDefinition | undefined {
  return HERO_FONTS.find((f) => f.family === family);
}

export function fontFamilyCss(font: HeroFont): string {
  const def = findFont(font.family);
  return `"${font.family}", ${def?.fallback ?? 'serif'}`;
}
