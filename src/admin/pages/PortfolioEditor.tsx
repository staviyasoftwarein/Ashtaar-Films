import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useSetting } from '../../hooks/useSetting';
import { publicUrl } from '../../lib/supabase';
import { uploadToMediaBucket, fileExtension } from '../../lib/storageUpload';
import { fetchYouTubeDuration, formatDuration } from '../../lib/youtubeDuration';
import {
  DEFAULT_PORTFOLIO,
  parseYouTubeId,
  ytThumb,
  type PortfolioConfig,
  type MusicTrack,
  type VfxTab,
} from '../../lib/portfolio';
import { Button, Card, Field, Input, Textarea, Toast } from '../components/ui';

type TabId = 'slide1' | 'slide2' | 'slide3' | 'slide4';
const TAB_FALLBACK: Record<TabId, { label: string; num: string }> = {
  slide1: { label: 'Theatrical', num: '01' },
  slide2: { label: 'Visual Effects', num: '02' },
  slide3: { label: 'Music', num: '03' },
  slide4: { label: 'AI Animation', num: '04' },
};

function deepEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function PortfolioEditor() {
  const { value: saved, loading, save } = useSetting<PortfolioConfig>('portfolio', DEFAULT_PORTFOLIO);
  const [draft, setDraft] = useState<PortfolioConfig>(saved);
  const [active, setActive] = useState<TabId>('slide1');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setDraft(saved); }, [saved]);

  const dirty = !deepEqual(draft, saved);

  const tabs: { id: TabId; label: string; num: string }[] = [
    { id: 'slide1', label: draft.slide1.title || TAB_FALLBACK.slide1.label, num: draft.slide1.num || TAB_FALLBACK.slide1.num },
    { id: 'slide2', label: draft.slide2.title || TAB_FALLBACK.slide2.label, num: draft.slide2.num || TAB_FALLBACK.slide2.num },
    { id: 'slide3', label: draft.slide3.title || TAB_FALLBACK.slide3.label, num: draft.slide3.num || TAB_FALLBACK.slide3.num },
    { id: 'slide4', label: draft.slide4.title || TAB_FALLBACK.slide4.label, num: draft.slide4.num || TAB_FALLBACK.slide4.num },
  ];

  const onSave = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await save(draft);
      setMsg({ kind: 'success', text: 'Saved. Reload the public site to see changes.' });
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Save failed' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <header>
        <h2 className="font-serif text-3xl text-white tracking-tight">Portfolio Section</h2>
        <p className="mt-1 text-sm text-[#A3A3A3] font-sans">
          Edit the four horizontal-scroll slides — titles, copy, YouTube videos and music tracks.
        </p>
      </header>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-[var(--color-line)] overflow-x-auto custom-scrollbar pb-px">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={[
                'relative flex items-center gap-3 px-4 py-3 text-sm font-sans transition-colors whitespace-nowrap',
                isActive ? 'text-[var(--color-gold)]' : 'text-[#A3A3A3] hover:text-white',
              ].join(' ')}
            >
              <span className="font-serif italic text-xs text-[var(--color-gold)]/70">{t.num}</span>
              <span className="font-medium">{t.label}</span>
              {isActive && (
                <motion.span
                  layoutId="portfolio-tab-underline"
                  className="absolute left-0 right-0 -bottom-px h-[2px] bg-[var(--color-gold)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div>
        {active === 'slide1' && <Slide1Form value={draft.slide1} onChange={(slide1) => setDraft({ ...draft, slide1 })} />}
        {active === 'slide2' && <Slide2Form value={draft.slide2} onChange={(slide2) => setDraft({ ...draft, slide2 })} />}
        {active === 'slide3' && <Slide3Form value={draft.slide3} onChange={(slide3) => setDraft({ ...draft, slide3 })} />}
        {active === 'slide4' && <Slide4Form value={draft.slide4} onChange={(slide4) => setDraft({ ...draft, slide4 })} />}
      </div>

      {msg && <Toast kind={msg.kind}>{msg.text}</Toast>}

      {/* Sticky save bar */}
      <AnimatePresence>
        {dirty && !loading && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-[calc(240px+24px)] right-6 z-30"
          >
            <div className="max-w-5xl mx-auto rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-surface)] backdrop-blur shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] flex items-center gap-4 p-4">
              <span className="text-sm font-sans text-white">Unsaved portfolio changes</span>
              <div className="ml-auto flex items-center gap-3">
                <Button variant="ghost" onClick={() => setDraft(saved)} disabled={busy}>Discard</Button>
                <Button variant="primary" onClick={onSave} loading={busy}>Save changes</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Slide 1 form ─────────────────────────────────────── */
function Slide1Form({ value, onChange }: { value: PortfolioConfig['slide1']; onChange: (v: PortfolioConfig['slide1']) => void }) {
  return (
    <Card title={value.title || 'Theatrical Release'} hint="Slide 01 — Dussehra-style feature film highlight.">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Title">
          <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} placeholder="Theatrical Release" />
        </Field>
        <Field label="Section number" hint="Shown as a stylized 01 / 02 / 03 / 04 above the title.">
          <Input value={value.num} onChange={(e) => onChange({ ...value, num: e.target.value })} placeholder="01" />
        </Field>
        <Field label="Subtitle" hint="The small label under the title (e.g. 'DUSSEHRA').">
          <Input value={value.subtitle} onChange={(e) => onChange({ ...value, subtitle: e.target.value })} />
        </Field>
        <YouTubeField
          label="Trailer YouTube link"
          value={value.youtubeId}
          onChange={(id) => onChange({ ...value, youtubeId: id })}
        />
      </div>
      <div className="mt-6">
        <Field label="Description">
          <Textarea value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} rows={4} />
        </Field>
      </div>
    </Card>
  );
}

/* ─── Slide 2 form ─────────────────────────────────────── */
function Slide2Form({ value, onChange }: { value: PortfolioConfig['slide2']; onChange: (v: PortfolioConfig['slide2']) => void }) {
  const updateTab = (i: number, patch: Partial<VfxTab>) => {
    const tabs = value.tabs.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    onChange({ ...value, tabs });
  };

  return (
    <div className="space-y-6">
      <Card title={value.title || 'Visual Effects'} hint="Slide 02 — shared title across both VFX and Anime tabs.">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Title">
            <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
          </Field>
          <Field label="Section number">
            <Input value={value.num} onChange={(e) => onChange({ ...value, num: e.target.value })} />
          </Field>
        </div>
      </Card>

      {value.tabs.map((tab, i) => (
        <Card key={tab.id} title={`Tab — ${tab.tag || (i === 0 ? 'VFX' : 'Anime')}`} hint="Pill button + content. Provide a YouTube link OR an uploaded image — the link wins if both are present.">
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Pill button text" hint="Shown in the toggle pill, e.g. 'VFX Production' or 'Anime 2D/3D'.">
              <Input value={tab.tag} onChange={(e) => updateTab(i, { tag: e.target.value })} />
            </Field>
            <Field label="Subtitle" hint="The headline shown under the pill, e.g. 'DEFYING REALITY'.">
              <Input value={tab.subtitle} onChange={(e) => updateTab(i, { subtitle: e.target.value })} />
            </Field>
          </div>
          <div className="mt-6">
            <Field label="Description">
              <Textarea value={tab.description} onChange={(e) => updateTab(i, { description: e.target.value })} rows={3} />
            </Field>
          </div>
          <div className="mt-6">
            <YouTubeField
              label="YouTube link"
              hint="Optional — if blank, the uploaded image (below) or a built-in fallback is used."
              value={tab.youtubeId}
              onChange={(id) => updateTab(i, { youtubeId: id })}
              allowEmpty
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 my-2">
              <span className="h-px flex-1 bg-[var(--color-line)]" />
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#525252]">or upload an image</span>
              <span className="h-px flex-1 bg-[var(--color-line)]" />
            </div>
            <ImageUploadField
              tabId={tab.id || `slide2-tab-${i}`}
              imagePath={tab.imagePath}
              disabled={!!tab.youtubeId}
              onChange={(imagePath) => updateTab(i, { imagePath })}
            />
            {tab.youtubeId && tab.imagePath && (
              <p className="mt-2 text-[11px] text-[#A3A3A3] font-sans">
                A YouTube link is set — that takes priority. Clear the link above to use the image instead.
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ─── Slide 3 form ─────────────────────────────────────── */
function Slide3Form({ value, onChange }: { value: PortfolioConfig['slide3']; onChange: (v: PortfolioConfig['slide3']) => void }) {
  const updateTrack = (i: number, patch: Partial<MusicTrack>) => {
    const tracks = value.tracks.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    onChange({ ...value, tracks });
  };
  const addTrack = () => {
    onChange({
      ...value,
      tracks: [
        ...value.tracks,
        { youtubeId: '', title: `Ashtaar Original - Track ${value.tracks.length + 1}`, artist: 'Ashtaar Music Production', time: '0:00' },
      ],
    });
  };
  const removeTrack = (i: number) => {
    onChange({ ...value, tracks: value.tracks.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-6">
      <Card title={value.title || 'Music Production'} hint="Slide 03 — the music player block.">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Title">
            <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
          </Field>
          <Field label="Section number">
            <Input value={value.num} onChange={(e) => onChange({ ...value, num: e.target.value })} />
          </Field>
          <Field label="Subtitle" hint="e.g. 'Custom Scores'.">
            <Input value={value.subtitle} onChange={(e) => onChange({ ...value, subtitle: e.target.value })} />
          </Field>
          <Field label="Full Playlist link" hint="YouTube playlist URL or Spotify URL — opens when 'Play Full Playlist' is clicked.">
            <Input
              value={value.playlistUrl}
              onChange={(e) => onChange({ ...value, playlistUrl: e.target.value })}
              placeholder="https://www.youtube.com/playlist?list=..."
            />
          </Field>
        </div>
      </Card>

      <Card title={`Tracks (${value.tracks.length})`} hint="Each row is a queued track. Title is editable independently of the YouTube link.">
        <div className="space-y-4">
          {value.tracks.map((tr, i) => {
            const id = parseYouTubeId(tr.youtubeId);
            return (
              <div
                key={i}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-4 flex gap-4"
              >
                <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-black border border-[var(--color-line)] flex items-center justify-center">
                  {id ? (
                    <img src={ytThumb(id, 'mq')} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-mono text-[#525252]">No preview</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-3">
                  <Field label={`Title ${i + 1}`}>
                    <Input value={tr.title} onChange={(e) => updateTrack(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Artist">
                    <Input value={tr.artist} onChange={(e) => updateTrack(i, { artist: e.target.value })} />
                  </Field>
                  <TrackDurationField
                    videoId={id}
                    current={tr.time}
                    onChange={(t) => updateTrack(i, { time: t })}
                  />
                  <YouTubeField
                    label="YouTube link"
                    value={tr.youtubeId}
                    onChange={(yid) => updateTrack(i, { youtubeId: yid })}
                    compact
                    allowEmpty
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTrack(i)}
                  className="self-start text-[#A3A3A3] hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/5"
                  aria-label={`Remove track ${i + 1}`}
                  title="Remove track"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={addTrack}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-[var(--color-line-strong)] text-[#A3A3A3] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/60 transition-colors text-sm font-sans"
          >
            <Plus size={14} /> Add track
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Slide 4 form ─────────────────────────────────────── */
function Slide4Form({ value, onChange }: { value: PortfolioConfig['slide4']; onChange: (v: PortfolioConfig['slide4']) => void }) {
  return (
    <Card title={value.title || 'AI Animation'} hint="Slide 04 — the AI / generative-tech showcase.">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Title">
          <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
        </Field>
        <Field label="Section number">
          <Input value={value.num} onChange={(e) => onChange({ ...value, num: e.target.value })} />
        </Field>
        <Field label="Subtitle">
          <Input value={value.subtitle} onChange={(e) => onChange({ ...value, subtitle: e.target.value })} />
        </Field>
        <YouTubeField
          label="YouTube link"
          value={value.youtubeId}
          onChange={(id) => onChange({ ...value, youtubeId: id })}
        />
      </div>
      <div className="mt-6">
        <Field label="Description">
          <Textarea value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} rows={4} />
        </Field>
      </div>
    </Card>
  );
}

/* ─── Read-only auto-fetched duration field ─────────────── */
function TrackDurationField({
  videoId,
  current,
  onChange,
}: {
  videoId: string;
  current: string;
  onChange: (time: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      setErrored(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErrored(false);

    fetchYouTubeDuration(videoId)
      .then((seconds) => {
        if (cancelled) return;
        setLoading(false);
        if (seconds == null) {
          setErrored(true);
          return;
        }
        const formatted = formatDuration(seconds);
        if (formatted && formatted !== current) onChange(formatted);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        setErrored(true);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const hint = !videoId
    ? 'Will auto-detect once a YouTube link is set.'
    : loading
    ? 'Fetching from YouTube…'
    : errored
    ? 'Could not fetch duration. Check the link.'
    : 'Auto-detected from the YouTube video.';

  return (
    <Field label="Duration" hint={hint}>
      <div className="w-full h-11 rounded-md bg-[var(--color-surface-2)]/60 border border-[var(--color-line)] px-3 flex items-center font-mono text-sm text-[#A3A3A3] select-none">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-[var(--color-gold)] border-t-transparent animate-spin" />
            <span>fetching…</span>
          </span>
        ) : (
          current || '—'
        )}
      </div>
    </Field>
  );
}

/* ─── Image upload field (Supabase media bucket) ──────── */
function ImageUploadField({
  tabId,
  imagePath,
  disabled,
  onChange,
}: {
  tabId: string;
  imagePath: string | undefined;
  disabled?: boolean;
  onChange: (path: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [previewBust, setPreviewBust] = useState(0);

  const previewUrl = imagePath
    ? `${publicUrl('media', imagePath)}${previewBust ? `?v=${previewBust}` : ''}`
    : null;

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMsg({ kind: 'error', text: 'Please select an image file.' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setMsg(null);
    try {
      const ext = fileExtension(file.name) || (file.type.split('/')[1] ?? 'jpg');
      const path = `portfolio/slide2-${tabId}-${Date.now()}.${ext}`;
      await uploadToMediaBucket({
        file,
        path,
        contentType: file.type || `image/${ext}`,
        onProgress: (p) => setProgress(p),
      });
      setProgress(100);
      onChange(path);
      setPreviewBust(Date.now());
      setMsg({ kind: 'success', text: 'Image uploaded. Save changes to publish.' });
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

  const clearImage = () => {
    onChange(undefined);
    setMsg(null);
  };

  return (
    <div className="space-y-3">
      {previewUrl && (
        <div className="flex items-start gap-3">
          <div className="w-40 aspect-video rounded-md overflow-hidden border border-[var(--color-line)] bg-black shrink-0">
            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-[11px] font-mono text-[#A3A3A3] truncate">media/{imagePath}</p>
            <button
              type="button"
              onClick={clearImage}
              className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-red-400 transition-colors"
              disabled={busy}
            >
              <X size={13} /> Remove image
            </button>
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => { if (disabled || busy) return; e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (disabled || busy) return;
          e.preventDefault();
          setDragOver(false);
          onPick(e.dataTransfer.files?.[0]);
        }}
        onClick={() => { if (!disabled && !busy) inputRef.current?.click(); }}
        role="button"
        tabIndex={0}
        aria-disabled={disabled || busy}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled && !busy) inputRef.current?.click(); }}
        className={[
          'rounded-lg border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center gap-2 py-7 px-6 text-center',
          disabled
            ? 'border-[var(--color-line)] bg-[var(--color-surface-2)]/40 opacity-60 cursor-not-allowed'
            : dragOver
            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/[0.05] cursor-pointer'
            : 'border-[var(--color-line-strong)] hover:border-[var(--color-gold)]/60 bg-[var(--color-surface-2)] cursor-pointer',
          busy && 'cursor-wait',
        ].join(' ')}
      >
        <Upload size={18} strokeWidth={1.5} className={disabled ? 'text-[#525252]' : 'text-[var(--color-gold)]'} />
        <p className="text-sm text-white font-sans">
          {imagePath ? 'Replace image' : (dragOver ? 'Drop to upload' : 'Drop an image here, or click to choose')}
        </p>
        <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#525252]">
          JPG · PNG · WEBP
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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

/* ─── Reusable YouTube field with thumbnail preview ───── */
function YouTubeField({
  label,
  hint,
  value,
  onChange,
  compact,
  allowEmpty,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (id: string) => void;
  compact?: boolean;
  allowEmpty?: boolean;
}) {
  const [raw, setRaw] = useState(value);
  useEffect(() => { setRaw(value); }, [value]);

  const parsed = useMemo(() => parseYouTubeId(raw), [raw]);
  const showThumb = !compact && parsed;
  const error = !allowEmpty && raw.trim() && !parsed ? 'Could not detect a YouTube video ID.' : undefined;

  return (
    <Field
      label={label}
      hint={hint ?? (parsed ? `Video ID: ${parsed}` : 'Paste a YouTube URL, share link, or 11-char video ID.')}
      error={error}
    >
      <div className={compact ? 'space-y-2' : 'flex flex-col md:flex-row gap-4 items-start'}>
        <Input
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            const id = parseYouTubeId(e.target.value);
            onChange(id || (allowEmpty ? '' : id));
          }}
          placeholder="https://www.youtube.com/watch?v=…"
          className={compact ? '' : 'flex-1 min-w-0'}
        />
        {showThumb && (
          <div className="w-32 aspect-video rounded-md overflow-hidden bg-black border border-[var(--color-line)] shrink-0">
            <img src={ytThumb(parsed, 'mq')} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </Field>
  );
}
