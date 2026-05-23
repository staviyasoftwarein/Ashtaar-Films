import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Upload } from 'lucide-react';
import { supabase, publicUrl } from '../../lib/supabase';
import { useSetting } from '../../hooks/useSetting';
import { HERO_FONTS, DEFAULT_HERO_FONT, fontFamilyCss, findFont, type HeroFont } from '../../lib/fonts';
import { Button, Card, Field, Select, Slider, Toggle, Toast } from '../components/ui';

const PREVIEW_TEXT = 'ASHTAAR';
const PRELOADER_PATH = 'preloader.mp4';

function fontEqual(a: HeroFont, b: HeroFont) {
  return (
    a.family === b.family &&
    a.weight === b.weight &&
    a.style === b.style &&
    a.letterSpacing === b.letterSpacing &&
    a.textTransform === b.textTransform
  );
}

export default function HeroEditor() {
  const { value: saved, loading, save } = useSetting<HeroFont>('hero.font', DEFAULT_HERO_FONT);
  const [draft, setDraft] = useState<HeroFont>(saved);
  const [savingFont, setSavingFont] = useState(false);
  const [fontMsg, setFontMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setDraft(saved); }, [saved]);

  const dirty = !fontEqual(draft, saved);
  const fontDef = findFont(draft.family);
  const availableWeights = fontDef?.weights ?? [400];
  const supportsItalic = fontDef?.italics ?? false;

  const onSaveFont = async () => {
    setSavingFont(true);
    setFontMsg(null);
    try {
      await save(draft);
      setFontMsg({ kind: 'success', text: 'Saved. Hero will update on next page load.' });
    } catch (e) {
      setFontMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Save failed' });
    } finally {
      setSavingFont(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-white tracking-tight">Hero Section</h2>
          <p className="mt-1 text-sm text-[#A3A3A3] font-sans">Wordmark typography & background video.</p>
        </div>
      </header>

      {/* Live Preview */}
      <LivePreview font={loading ? saved : draft} />

      {/* Typography card */}
      <Card title="Typography" hint="Font, weight, style and letter spacing for the ASHTAAR wordmark.">
        <div className="space-y-7">
          <Field label="Font family">
            <FontGrid
              value={draft.family}
              onChange={(family) => {
                const def = findFont(family)!;
                setDraft({
                  ...draft,
                  family,
                  weight: def.weights.includes(draft.weight) ? draft.weight : def.weights[def.weights.length - 1],
                  style: def.italics ? draft.style : 'normal',
                });
              }}
            />
          </Field>

          <div className="grid md:grid-cols-3 gap-6">
            <Field label="Weight">
              <Select
                value={draft.weight}
                onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) })}
              >
                {availableWeights.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </Select>
            </Field>

            <Field label="Style">
              <Toggle
                checked={draft.style === 'italic'}
                onChange={(v) => setDraft({ ...draft, style: v ? 'italic' : 'normal' })}
                disabled={!supportsItalic}
                label={draft.style === 'italic' ? 'Italic' : 'Regular'}
              />
            </Field>

            <Field label="Transform">
              <Select
                value={draft.textTransform ?? 'uppercase'}
                onChange={(e) =>
                  setDraft({ ...draft, textTransform: e.target.value as 'uppercase' | 'none' })
                }
              >
                <option value="uppercase">UPPERCASE</option>
                <option value="none">As typed</option>
              </Select>
            </Field>
          </div>

          <Field label={`Letter spacing — ${draft.letterSpacing}`}>
            <Slider
              min={-0.05}
              max={0.30}
              step={0.01}
              value={parseFloat(draft.letterSpacing) || 0}
              onChange={(v) => setDraft({ ...draft, letterSpacing: `${v.toFixed(2)}em` })}
              suffix="em"
            />
          </Field>

          {fontMsg && <Toast kind={fontMsg.kind}>{fontMsg.text}</Toast>}
        </div>
      </Card>

      {/* Video card */}
      <Card title="Background Video" hint="Replaces the looping video behind the wordmark. Any file you upload becomes preloader.mp4 in the bucket.">
        <VideoUploader />
      </Card>

      {/* Sticky save bar */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-[calc(240px+24px)] right-6 z-30"
          >
            <div className="max-w-5xl mx-auto rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-surface)] backdrop-blur shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] flex items-center gap-4 p-4">
              <span className="text-sm font-sans text-white">Unsaved typography changes</span>
              <div className="ml-auto flex items-center gap-3">
                <Button variant="ghost" onClick={() => setDraft(saved)} disabled={savingFont}>Discard</Button>
                <Button variant="primary" onClick={onSaveFont} loading={savingFont}>Save changes</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Live Preview ─────────────────────────────────────── */
function LivePreview({ font }: { font: HeroFont }) {
  return (
    <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden border border-[var(--color-line)] bg-black">
      {/* Subtle ambient (matching Hero/AmbientBackground vibe) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05),transparent_60%)]" />
      <div className="absolute top-3 left-4 text-[10px] font-sans uppercase tracking-[0.3em] text-[#525252]">
        Live preview
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <span
          className="text-white whitespace-nowrap"
          style={{
            fontFamily: fontFamilyCss(font),
            fontWeight: font.weight,
            fontStyle: font.style,
            letterSpacing: font.letterSpacing,
            textTransform: font.textTransform ?? 'uppercase',
            fontSize: 'clamp(48px, 9vw, 140px)',
            lineHeight: 1,
          }}
        >
          {PREVIEW_TEXT}
        </span>
      </div>
    </div>
  );
}

/* ─── Font Grid ───────────────────────────────────────── */
function FontGrid({ value, onChange }: { value: string; onChange: (family: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {HERO_FONTS.map((f) => {
        const selected = f.family === value;
        return (
          <button
            type="button"
            key={f.family}
            onClick={() => onChange(f.family)}
            className={[
              'relative h-24 rounded-lg border text-left p-4 transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]',
              selected
                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/[0.06]'
                : 'border-[var(--color-line)] bg-[var(--color-surface-2)] hover:border-[var(--color-line-strong)]',
            ].join(' ')}
            aria-pressed={selected}
          >
            <span
              className="block text-white truncate"
              style={{
                fontFamily: `"${f.family}", ${f.fallback}`,
                fontWeight: f.weights[f.weights.length - 1],
                fontSize: 28,
                lineHeight: 1.1,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              ASHTAAR
            </span>
            <span className="block mt-1 text-[10px] font-sans uppercase tracking-[0.2em] text-[#525252]">
              {f.family}
            </span>
            {selected && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-gold)] text-black flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Video Uploader ───────────────────────────────────── */
function VideoUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [version, setVersion] = useState(0); // bump to force preview re-fetch

  const currentSrc = useMemo(
    () => `${publicUrl('media', PRELOADER_PATH)}?v=${version}`,
    [version]
  );

  const upload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setMsg({ kind: 'error', text: 'Please select a video file.' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setMsg({ kind: 'info', text: `Uploading ${file.name} → preloader.mp4 …` });

    try {
      // Get a fresh access token for the signed REST call
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/+$/, '');
      const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const url = `${supabaseUrl}/storage/v1/object/media/${PRELOADER_PATH}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('apikey', apikey);
        xhr.setRequestHeader('x-upsert', 'true');
        xhr.setRequestHeader('Content-Type', 'video/mp4');
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });

      // Touch the assets row so updated_at moves and downstream caches bust on reload
      const { error: upsertErr } = await supabase
        .from('assets')
        .upsert(
          { key: 'preloader', bucket: 'media', path: PRELOADER_PATH, kind: 'video', alt: 'Hero preloader background video' },
          { onConflict: 'key' }
        );
      if (upsertErr) throw upsertErr;

      setProgress(100);
      setMsg({ kind: 'success', text: 'Video replaced. Reload the public site to see it.' });
      setVersion((v) => v + 1);
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Upload failed' });
    } finally {
      setBusy(false);
    }
  };

  const onPick = (file?: File) => {
    if (!file) return;
    upload(file);
  };

  return (
    <div className="space-y-5">
      {/* Current preview */}
      <div className="flex flex-col md:flex-row gap-5">
        <div className="md:w-[260px] aspect-video rounded-lg overflow-hidden border border-[var(--color-line)] bg-black shrink-0">
          <video
            key={currentSrc}
            src={currentSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs font-sans uppercase tracking-[0.18em] text-[#A3A3A3]">
            Currently live · media/preloader.mp4
          </p>
          <p className="mt-2 text-sm text-[#A3A3A3] font-sans leading-relaxed">
            Drag a video onto the area below or click to choose a file. Whatever filename you pick locally,
            it will be uploaded as <span className="font-mono text-white">preloader.mp4</span>, replacing the
            current background.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onPick(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        className={[
          'rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
          'flex flex-col items-center justify-center gap-2 py-10 px-6 text-center',
          dragOver
            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/[0.05]'
            : 'border-[var(--color-line-strong)] hover:border-[var(--color-gold)]/60 bg-[var(--color-surface-2)]',
          busy && 'opacity-50 cursor-wait',
        ].join(' ')}
      >
        <Upload size={20} strokeWidth={1.5} className="text-[var(--color-gold)]" />
        <p className="text-sm text-white font-sans">
          {dragOver ? 'Drop to upload' : 'Drop a video here, or click to choose'}
        </p>
        <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#525252]">
          MP4 · WebM · MOV
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? undefined)}
        />
      </div>

      {busy && (
        <div className="space-y-2">
          <div className="h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-gold)] transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-mono text-[#A3A3A3]">{progress}%</p>
        </div>
      )}

      {msg && <Toast kind={msg.kind}>{msg.text}</Toast>}
    </div>
  );
}
