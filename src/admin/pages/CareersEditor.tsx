import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Upload, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useSetting } from '../../hooks/useSetting';
import { uploadToMediaBucket, fileExtension, tryDeleteFromMediaBucket } from '../../lib/storageUpload';
import {
  DEFAULT_CAREERS,
  MAX_CAREER_ROLES,
  nextRoleId,
  resolveCareerImageUrl,
  type CareersConfig,
  type CareerRole,
} from '../../lib/careers';
import { Button, Card, Field, Input, Textarea, Toast, Toggle } from '../components/ui';

function deepEqual<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function CareersEditor() {
  const { value: saved, loading, save } = useSetting<CareersConfig>('careers', DEFAULT_CAREERS);
  const [draft, setDraft] = useState<CareersConfig>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setDraft(saved); }, [saved]);

  const dirty = !deepEqual(draft, saved);
  const activeCount = draft.roles.filter((r) => r.active).length;
  const atMax = draft.roles.length >= MAX_CAREER_ROLES;

  const updateRole = (i: number, patch: Partial<CareerRole>) => {
    const roles = draft.roles.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    setDraft({ ...draft, roles });
  };

  const addRole = () => {
    if (atMax) return;
    const id = nextRoleId(draft.roles);
    if (!id) return;
    setDraft({
      ...draft,
      roles: [
        ...draft.roles,
        { id, active: true, dept: 'Department', title: 'Role title', quote: 'A short, evocative line.', imagePath: '' },
      ],
    });
  };

  const removeRole = async (i: number) => {
    const target = draft.roles[i];
    if (target?.imagePath) await tryDeleteFromMediaBucket(target.imagePath);
    setDraft({ ...draft, roles: draft.roles.filter((_, idx) => idx !== i) });
  };

  const moveRole = (i: number, dir: -1 | 1) => {
    const next = i + dir;
    if (next < 0 || next >= draft.roles.length) return;
    const roles = [...draft.roles];
    [roles[i], roles[next]] = [roles[next], roles[i]];
    setDraft({ ...draft, roles });
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
        <h2 className="font-serif text-3xl text-white tracking-tight">Careers</h2>
        <p className="mt-1 text-sm text-[#A3A3A3] font-sans">
          The hero copy and the open-positions list. Toggle roles on/off, reorder, replace hover images.
        </p>
      </header>

      <Card title="Hero copy" hint="Eyebrow, two title lines, and the italic quote.">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Eyebrow" hint="Small mono uppercase line above the title (e.g. 'Join The Cult').">
            <Input
              value={draft.eyebrow}
              onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })}
              placeholder="Join The Cult"
            />
          </Field>
          <Field label="Title — line 1 (white)">
            <Input
              value={draft.titleLine1}
              onChange={(e) => setDraft({ ...draft, titleLine1: e.target.value })}
              placeholder="We don't hire employees."
            />
          </Field>
          <Field label="Title — line 2 (gold)" hint="Rendered in gold on the public site.">
            <Input
              value={draft.titleLine2}
              onChange={(e) => setDraft({ ...draft, titleLine2: e.target.value })}
              placeholder="We recruit fanatics."
            />
          </Field>
        </div>
        <div className="mt-6">
          <Field label="Description" hint="The italic blockquote under the title. Line breaks preserved on the public site.">
            <Textarea
              rows={5}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card
        title={`Open positions (${draft.roles.length}/${MAX_CAREER_ROLES} · ${activeCount} active)`}
        hint="Inactive roles are hidden from the public site. Only active roles count toward 'Open Positions [N]'."
      >
        <div className="space-y-4">
          {draft.roles.map((role, i) => (
            <div key={role.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <CareerImageUploader
                  roleId={role.id}
                  imagePath={role.imagePath}
                  onChange={(p) => updateRole(i, { imagePath: p })}
                />

                <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-3">
                  <Field label="Department">
                    <Input
                      value={role.dept}
                      onChange={(e) => updateRole(i, { dept: e.target.value })}
                      placeholder="Direction"
                    />
                  </Field>
                  <Field label="Role title">
                    <Input
                      value={role.title}
                      onChange={(e) => updateRole(i, { title: e.target.value })}
                      placeholder="Director"
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Quote" hint="Shown over the hero image when the role is opened.">
                      <Textarea
                        rows={2}
                        value={role.quote}
                        onChange={(e) => updateRole(i, { quote: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-4 self-start shrink-0">
                  <Toggle
                    checked={role.active}
                    onChange={(v) => updateRole(i, { active: v })}
                    label={role.active ? 'Active' : 'Inactive'}
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveRole(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="p-1.5 rounded text-[#A3A3A3] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRole(i, 1)}
                      disabled={i === draft.roles.length - 1}
                      aria-label="Move down"
                      className="p-1.5 rounded text-[#A3A3A3] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRole(i)}
                    className="text-[#A3A3A3] hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/5"
                    aria-label={`Remove ${role.title}`}
                    title="Remove role"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addRole}
            disabled={atMax}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-[var(--color-line-strong)] text-[#A3A3A3] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/60 transition-colors text-sm font-sans disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[#A3A3A3] disabled:hover:border-[var(--color-line-strong)]"
          >
            <Plus size={14} /> {atMax ? `Maximum ${MAX_CAREER_ROLES} roles reached` : 'Add role'}
          </button>
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
              <span className="text-sm font-sans text-white">Unsaved careers changes</span>
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

/* ─── Hover-image uploader (image only, ~16:10 thumbnail) ── */
function CareerImageUploader({
  roleId,
  imagePath,
  onChange,
}: {
  roleId: string;
  imagePath: string;
  onChange: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bust, setBust] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const url = imagePath
    ? `${resolveCareerImageUrl(imagePath)}${bust ? (imagePath.includes('?') ? `&v=${bust}` : `?v=${bust}`) : ''}`
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
      const path = `careers/career${roleId}-${Date.now()}.${ext}`;
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
    <div className="space-y-2 w-[160px] shrink-0">
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="relative w-full aspect-[16/10] rounded-md overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface-2)] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
      >
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#525252]">
            <Upload size={16} strokeWidth={1.5} />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em]">add image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-[11px] font-sans text-white px-2 py-1 rounded bg-black/50">
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

      <p className="text-[9px] font-mono text-[#525252] truncate">
        {imagePath ? imagePath : `careers/career${roleId}.{ext}`}
      </p>

      {imagePath && !busy && (
        <button
          type="button"
          onClick={async () => {
            await tryDeleteFromMediaBucket(imagePath);
            onChange('');
          }}
          className="text-[10px] font-sans text-[#A3A3A3] hover:text-red-400 transition-colors inline-flex items-center gap-1"
        >
          <X size={11} /> Remove
        </button>
      )}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
