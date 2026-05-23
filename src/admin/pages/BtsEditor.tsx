import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { useSetting } from '../../hooks/useSetting';
import { uploadToMediaBucket, fileExtension, tryDeleteFromMediaBucket } from '../../lib/storageUpload';
import { BTS_MAX_IMAGES, DEFAULT_BTS, nextBtsId, resolveBtsImageUrl, type BtsConfig, type BtsImage } from '../../lib/bts';
import { Button, Card, Field, Input, Toast } from '../components/ui';

function deepEqual<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function BtsEditor() {
  const { value: saved, loading, save } = useSetting<BtsConfig>('bts', DEFAULT_BTS);
  const [draft, setDraft] = useState<BtsConfig>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setDraft(saved); }, [saved]);

  const dirty = !deepEqual(draft, saved);

  const updateImage = (i: number, patch: Partial<BtsImage>) => {
    const images = draft.images.map((img, idx) => (idx === i ? { ...img, ...patch } : img));
    setDraft({ ...draft, images });
  };

  const addImage = () => {
    if (draft.images.length >= BTS_MAX_IMAGES) return;
    const id = nextBtsId(draft.images);
    setDraft({ ...draft, images: [...draft.images, { id, imagePath: '' }] });
  };

  const removeImage = async (i: number) => {
    const target = draft.images[i];
    if (target?.imagePath) await tryDeleteFromMediaBucket(target.imagePath);
    setDraft({ ...draft, images: draft.images.filter((_, idx) => idx !== i) });
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
        <h2 className="font-serif text-3xl text-white tracking-tight">Behind the Scenes</h2>
        <p className="mt-1 text-sm text-[#A3A3A3] font-sans">
          The "Vision beyond the lens" 3D scroll gallery — eyebrow, headline, and {draft.images.length} images.
        </p>
      </header>

      <Card title="Section heading" hint="Small gold eyebrow + the large serif title beneath it.">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Eyebrow">
            <Input
              value={draft.eyebrow}
              onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })}
              placeholder="Behind The Scenes"
            />
          </Field>
          <Field label="Title">
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Vision beyond the lens."
            />
          </Field>
        </div>
      </Card>

      <Card title={`Images (${draft.images.length} / ${BTS_MAX_IMAGES})`} hint="Each tile flies into view as the user scrolls. Files are stored in the bucket as bts/bts{n}.{ext} — replacing with a different format auto-removes the previous file. Add up to 15; the gallery adapts to the count.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {draft.images.map((img, i) => (
            <BtsTile
              key={img.id || i}
              index={i + 1}
              imageId={img.id || String(i + 1)}
              imagePath={img.imagePath}
              onChange={(p) => updateImage(i, { imagePath: p })}
              onRemoveSlot={() => removeImage(i)}
            />
          ))}

          {draft.images.length < BTS_MAX_IMAGES && (
            <button
              type="button"
              onClick={addImage}
              className="aspect-[16/9] rounded-md border border-dashed border-[var(--color-line-strong)] flex flex-col items-center justify-center gap-2 text-[#A3A3A3] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors self-start"
            >
              <Plus size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">add image</span>
            </button>
          )}
        </div>
      </Card>

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
              <span className="text-sm font-sans text-white">Unsaved BTS changes</span>
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

/* ─── Single BTS image tile uploader ───────────────────── */
function BtsTile({
  index,
  imageId,
  imagePath,
  onChange,
  onRemoveSlot,
}: {
  index: number;
  imageId: string;
  imagePath: string;
  onChange: (path: string) => void;
  onRemoveSlot: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bust, setBust] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const url = imagePath
    ? `${resolveBtsImageUrl(imagePath)}${bust ? (imagePath.includes('?') ? `&v=${bust}` : `?v=${bust}`) : ''}`
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
      const path = `bts/bts${imageId}.${ext}`;
      if (imagePath && imagePath !== path) {
        await tryDeleteFromMediaBucket(imagePath);
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
        className="relative w-full aspect-[16/9] rounded-md overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface-2)] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
      >
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#525252]">
            <Upload size={18} strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">add image</span>
          </div>
        )}
        <span className="absolute top-1.5 left-2 text-[9px] font-mono uppercase tracking-[0.25em] text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
          bts{index}
        </span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-xs font-sans text-white px-2 py-1 rounded bg-black/50">
            {imagePath ? 'Replace' : 'Upload'}
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

      <p className="text-[10px] font-mono text-[#525252] truncate">
        {imagePath || `bts/bts${imageId}.{ext}`}
      </p>

      <div className="flex items-center justify-between gap-2">
        {imagePath && !busy ? (
          <button
            type="button"
            onClick={async () => {
              await tryDeleteFromMediaBucket(imagePath);
              onChange('');
            }}
            className="text-[11px] font-sans text-[#A3A3A3] hover:text-red-400 transition-colors inline-flex items-center gap-1"
          >
            <X size={12} /> Clear image
          </button>
        ) : <span />}

        <button
          type="button"
          disabled={busy}
          onClick={onRemoveSlot}
          className="text-[11px] font-sans text-[#A3A3A3] hover:text-red-400 transition-colors inline-flex items-center gap-1 disabled:opacity-40"
          title="Delete this slot"
        >
          <Trash2 size={12} /> Delete slot
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
