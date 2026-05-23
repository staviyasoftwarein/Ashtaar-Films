import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Upload, X } from 'lucide-react';
import { useSetting } from '../../hooks/useSetting';
import { uploadToMediaBucket, fileExtension, tryDeleteFromMediaBucket } from '../../lib/storageUpload';
import { DEFAULT_TEAM, resolveTeamImageUrl, type TeamConfig, type TeamMember } from '../../lib/team';
import { Button, Card, Field, Input, Toast } from '../components/ui';

function deepEqual<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function TeamEditor() {
  const { value: saved, loading, save } = useSetting<TeamConfig>('team', DEFAULT_TEAM);
  const [draft, setDraft] = useState<TeamConfig>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setDraft(saved); }, [saved]);

  const dirty = !deepEqual(draft, saved);

  const updateMember = (i: number, patch: Partial<TeamMember>) => {
    const members = draft.members.map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    setDraft({ ...draft, members });
  };

  const removeMember = async (i: number) => {
    const target = draft.members[i];
    if (target?.imagePath) await tryDeleteFromMediaBucket(target.imagePath);
    setDraft({ ...draft, members: draft.members.filter((_, idx) => idx !== i) });
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
        <h2 className="font-serif text-3xl text-white tracking-tight">Faces Behind The Lens</h2>
        <p className="mt-1 text-sm text-[#A3A3A3] font-sans">
          The eyebrow, the heading, and the people that follow.
        </p>
      </header>

      <Card title="Section heading" hint="Small gold eyebrow + the large serif title beneath it.">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Eyebrow" hint="The small gold uppercase text above the title.">
            <Input
              value={draft.eyebrow}
              onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })}
              placeholder="The Visionaries"
            />
          </Field>
          <Field label="Title" hint="The big serif heading.">
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Faces Behind The Lens"
            />
          </Field>
        </div>
      </Card>

      <Card title={`Members (${draft.members.length})`} hint="Each card on the public site reads from one row here. Photo replaces the polaroid image.">
        <div className="space-y-5">
          {draft.members.map((m, i) => (
            <div key={m.id || i} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-5">
              <div className="flex flex-col md:flex-row gap-5">
                <MemberPhotoUploader
                  memberId={m.id || String(i + 1)}
                  imagePath={m.imagePath}
                  onChange={(p) => updateMember(i, { imagePath: p })}
                />

                <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-4 self-start">
                  <Field label="Name">
                    <Input
                      value={m.name}
                      onChange={(e) => updateMember(i, { name: e.target.value })}
                      placeholder="Chinmay Naik"
                    />
                  </Field>
                  <Field label="Role">
                    <Input
                      value={m.role}
                      onChange={(e) => updateMember(i, { role: e.target.value })}
                      placeholder="Director"
                    />
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={() => removeMember(i)}
                  className="self-start text-[#A3A3A3] hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/5"
                  aria-label={`Remove ${m.name || `member ${i + 1}`}`}
                  title="Remove member"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
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
              <span className="text-sm font-sans text-white">Unsaved team changes</span>
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

/* ─── Member photo uploader (3:4 portrait, image only) ── */
function MemberPhotoUploader({
  memberId,
  imagePath,
  onChange,
}: {
  memberId: string;
  imagePath: string;
  onChange: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bust, setBust] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const url = imagePath
    ? `${resolveTeamImageUrl(imagePath)}${bust ? (imagePath.includes('?') ? `&v=${bust}` : `?v=${bust}`) : ''}`
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
      const path = `team/imp_person${memberId}.${ext}`;
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
    <div className="space-y-2 w-[200px] shrink-0">
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="relative w-full aspect-[3/4] rounded-md overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface-2)] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
      >
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#525252]">
            <Upload size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">add photo</span>
          </div>
        )}
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
        {imagePath ? imagePath : `Will save as team/imp_person${memberId}.{ext}`}
      </p>

      {imagePath && !busy && (
        <button
          type="button"
          onClick={async () => {
            await tryDeleteFromMediaBucket(imagePath);
            onChange('');
          }}
          className="text-[11px] font-sans text-[#A3A3A3] hover:text-red-400 transition-colors inline-flex items-center gap-1"
        >
          <X size={12} /> Remove photo
        </button>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
