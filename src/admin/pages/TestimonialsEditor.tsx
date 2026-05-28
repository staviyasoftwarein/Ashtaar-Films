import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Volume2, VolumeX, Trash2, Plus } from 'lucide-react';
import { useSetting } from '../../hooks/useSetting';
import { uploadToMediaBucket, fileExtension, tryDeleteFromMediaBucket } from '../../lib/storageUpload';
import {
  DEFAULT_TESTIMONIALS,
  resolveTestimonialMediaUrl,
  type Testimonial,
  type TestimonialsConfig,
} from '../../lib/testimonials';
import { Button, Card, Field, Input, Textarea, Toast } from '../components/ui';

function deepEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function TestimonialsEditor() {
  const { value: saved, loading, save } = useSetting<TestimonialsConfig>(
    'testimonials',
    DEFAULT_TESTIMONIALS
  );
  const [draft, setDraft] = useState<TestimonialsConfig>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setDraft(saved); }, [saved]);

  const dirty = !deepEqual(draft, saved);

  const updateItem = (i: number, patch: Partial<Testimonial>) => {
    const items = draft.items.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    setDraft({ ...draft, items });
  };

  const nextId = (): string => {
    const nums = draft.items.map((t) => Number(t.id)).filter((n) => Number.isFinite(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return String(max + 1);
  };

  const addItem = () => {
    const item: Testimonial = {
      id: nextId(),
      quote: '',
      author: '',
      role: '',
      avatarPath: '',
      mediaPath: '',
      mediaKind: 'image',
    };
    setDraft({ ...draft, items: [...draft.items, item] });
  };

  const removeItem = async (i: number) => {
    const target = draft.items[i];
    if (target?.avatarPath) await tryDeleteFromMediaBucket(target.avatarPath);
    if (target?.mediaPath) await tryDeleteFromMediaBucket(target.mediaPath);
    setDraft({ ...draft, items: draft.items.filter((_, idx) => idx !== i) });
  };

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
        <h2 className="font-serif text-3xl text-white tracking-tight">Testimonials</h2>
        <p className="mt-1 text-sm text-[#A3A3A3] font-sans">
          Client voices. Each has a quote, an author, an avatar, and a hero media (image or video).
          Add, edit, or remove as many as you like — changes show on the public carousel.
        </p>
      </header>

      <div className="space-y-6">
        {draft.items.map((t, i) => (
          <Card
            key={t.id}
            title={`${String(i + 1).padStart(2, '0')} — ${t.author || 'Untitled testimonial'}`}
            hint={t.role || undefined}
          >
            <div className="flex justify-end -mt-2 mb-2">
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="inline-flex items-center gap-1.5 text-xs font-sans text-[#A3A3A3] hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-red-500/5"
                aria-label={`Delete testimonial ${i + 1}`}
                title="Delete testimonial"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
            <div className="grid lg:grid-cols-[1fr_220px] gap-6">
              <div className="space-y-5">
                <Field label="Quote">
                  <Textarea
                    rows={3}
                    value={t.quote}
                    onChange={(e) => updateItem(i, { quote: e.target.value })}
                    placeholder='"They brought our cinematic vision to life…"'
                  />
                </Field>
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Author">
                    <Input
                      value={t.author}
                      onChange={(e) => updateItem(i, { author: e.target.value })}
                      placeholder="Elena Vance"
                    />
                  </Field>
                  <Field label="Role">
                    <Input
                      value={t.role}
                      onChange={(e) => updateItem(i, { role: e.target.value })}
                      placeholder="Production Lead, Aether Studios"
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-sans uppercase tracking-[0.18em] text-[#A3A3A3]">Author avatar</p>
                <AvatarUploader
                  testimonialId={t.id}
                  avatarPath={t.avatarPath}
                  onChange={(avatarPath) => updateItem(i, { avatarPath })}
                />
              </div>
            </div>

            <div className="mt-7 pt-6 border-t border-[var(--color-line)]">
              <p className="text-xs font-sans uppercase tracking-[0.18em] text-[#A3A3A3] mb-3">
                Hero media — image or video (replaces previous file)
              </p>
              <MainMediaUploader
                testimonialId={t.id}
                mediaPath={t.mediaPath}
                mediaKind={t.mediaKind}
                onChange={(mediaPath, mediaKind) => updateItem(i, { mediaPath, mediaKind })}
              />
            </div>
          </Card>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-xl border border-dashed border-[var(--color-line-strong)] text-sm font-sans text-[#A3A3A3] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors"
        >
          <Plus size={16} /> Add testimonial
        </button>
      </div>

      {msg && <Toast kind={msg.kind}>{msg.text}</Toast>}

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
              <span className="text-sm font-sans text-white">Unsaved testimonial changes</span>
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

/* ─── Avatar uploader (square thumbnail, image only) ───── */
function AvatarUploader({
  testimonialId,
  avatarPath,
  onChange,
}: {
  testimonialId: string;
  avatarPath: string;
  onChange: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bust, setBust] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const url = avatarPath
    ? `${resolveTestimonialMediaUrl(avatarPath)}${bust ? (avatarPath.includes('?') ? `&v=${bust}` : `?v=${bust}`) : ''}`
    : '';

  const onPick = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setBusy(true);
    setProgress(0);
    setError(null);
    try {
      const ext = fileExtension(file.name) || (file.type.split('/')[1] ?? 'jpg');
      const path = `testimonials/avatar_${testimonialId}-${Date.now()}.${ext}`;
      // Different path? remove the previous bucket file.
      if (avatarPath && avatarPath !== path) {
        await tryDeleteFromMediaBucket(avatarPath);
      }
      await uploadToMediaBucket({
        file,
        path,
        contentType: file.type || `image/${ext}`,
        onProgress: setProgress,
      });
      onChange(path);
      setBust(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="relative w-full aspect-square rounded-lg overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface-2)] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
      >
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#525252]">
            <Upload size={18} strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">add avatar</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-xs font-sans text-white px-2 py-1 rounded bg-black/50">
            {avatarPath ? 'Replace' : 'Upload'}
          </span>
        </div>
        {busy && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--color-surface-2)]">
            <div className="h-full bg-[var(--color-gold)] transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? undefined)}
      />

      {avatarPath && !busy && (
        <button
          type="button"
          onClick={async () => {
            await tryDeleteFromMediaBucket(avatarPath);
            onChange('');
          }}
          className="text-[11px] font-sans text-[#A3A3A3] hover:text-red-400 transition-colors inline-flex items-center gap-1"
        >
          <X size={12} /> Remove avatar
        </button>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ─── Main media uploader (image or video) ─────────────── */
function MainMediaUploader({
  testimonialId,
  mediaPath,
  mediaKind,
  onChange,
}: {
  testimonialId: string;
  mediaPath: string;
  mediaKind: 'image' | 'video';
  onChange: (path: string, kind: 'image' | 'video') => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewBust, setPreviewBust] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  const url = mediaPath
    ? `${resolveTestimonialMediaUrl(mediaPath)}${previewBust ? (mediaPath.includes('?') ? `&v=${previewBust}` : `?v=${previewBust}`) : ''}`
    : '';

  const onPick = async (file?: File) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      setError('Please choose an image or video file.');
      return;
    }
    setBusy(true);
    setProgress(0);
    setError(null);
    try {
      const ext = fileExtension(file.name) || (file.type.split('/')[1] ?? (isVideo ? 'mp4' : 'jpg'));
      const path = `testimonials/Testimonial_${testimonialId}-${Date.now()}.${ext}`;
      if (mediaPath && mediaPath !== path) {
        await tryDeleteFromMediaBucket(mediaPath);
      }
      await uploadToMediaBucket({
        file,
        path,
        contentType: file.type,
        onProgress: setProgress,
      });
      onChange(path, isVideo ? 'video' : 'image');
      setPreviewBust(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {url && (
        <div className="grid md:grid-cols-[260px_1fr] gap-4 items-start">
          <div className="aspect-[4/5] md:aspect-square rounded-md overflow-hidden border border-[var(--color-line)] bg-black relative">
            {mediaKind === 'video' ? (
              <>
                <video
                  key={url}
                  src={url}
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? 'Unmute preview' : 'Mute preview'}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </>
            ) : (
              <img src={url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-mono text-[#A3A3A3] truncate">{mediaPath}</p>
            <p className="text-[11px] font-sans text-[#525252]">
              Type: <span className="text-white uppercase tracking-[0.2em] font-mono">{mediaKind}</span>
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                await tryDeleteFromMediaBucket(mediaPath);
                onChange('', mediaKind);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-red-400 transition-colors"
            >
              <X size={13} /> Remove media
            </button>
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => { if (busy) return; e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (busy) return;
          e.preventDefault();
          setDragOver(false);
          onPick(e.dataTransfer.files?.[0]);
        }}
        onClick={() => { if (!busy) inputRef.current?.click(); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !busy) inputRef.current?.click(); }}
        className={[
          'rounded-lg border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center gap-2 py-7 px-6 text-center cursor-pointer',
          dragOver
            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/[0.05]'
            : 'border-[var(--color-line-strong)] hover:border-[var(--color-gold)]/60 bg-[var(--color-surface-2)]',
          busy && 'cursor-wait opacity-70',
        ].join(' ')}
      >
        <Upload size={18} strokeWidth={1.5} className="text-[var(--color-gold)]" />
        <p className="text-sm text-white font-sans">
          {mediaPath ? 'Replace media' : (dragOver ? 'Drop to upload' : 'Drop a file or click to choose')}
        </p>
        <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#525252]">
          Image (JPG · PNG · WEBP) or Video (MP4 · WEBM · MOV)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? undefined)}
        />
      </div>

      {busy && (
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
            <div className="h-full bg-[var(--color-gold)] transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs font-mono text-[#A3A3A3]">{progress}%</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 font-sans">{error}</p>}
    </div>
  );
}
