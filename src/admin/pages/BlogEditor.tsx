import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ChevronUp, ChevronDown, Upload, X, Volume2, VolumeX } from 'lucide-react';
import { useSetting } from '../../hooks/useSetting';
import { uploadToMediaBucket, fileExtension, tryDeleteFromMediaBucket } from '../../lib/storageUpload';
import { DEFAULT_BLOG, formatBlogDate, nextBlogId, resolveBlogMediaUrl, todayIsoDate, toIsoDate, type BlogConfig, type BlogPost } from '../../lib/blog';
import { Button, Card, Field, Input, Textarea, Toast } from '../components/ui';

function deepEqual<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function BlogEditor() {
  const { value: saved, loading, save } = useSetting<BlogConfig>('blog', DEFAULT_BLOG);
  const [draft, setDraft] = useState<BlogConfig>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [sessionNew, setSessionNew] = useState<Set<string>>(new Set());

  useEffect(() => { setDraft(saved); setSessionNew(new Set()); }, [saved]);

  const dirty = !deepEqual(draft, saved);

  const updatePost = (i: number, patch: Partial<BlogPost>) => {
    const posts = draft.posts.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    setDraft({ ...draft, posts });
  };

  const addPost = () => {
    const id = nextBlogId(draft.posts);
    setDraft({
      ...draft,
      // Append at the bottom in-session so the existing "Live #1..3" cards
      // don't shift under the user's scroll position. onSave reorders them
      // to the top so they appear newest-first on next mount.
      posts: [
        ...draft.posts,
        { id, title: '', category: '', date: todayIsoDate(), comments: 0, excerpt: '', content: '', mediaPath: '', mediaKind: 'image' },
      ],
    });
    setSessionNew((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const removePost = async (i: number) => {
    const target = draft.posts[i];
    if (target?.mediaPath) await tryDeleteFromMediaBucket(target.mediaPath);
    setDraft({ ...draft, posts: draft.posts.filter((_, idx) => idx !== i) });
  };

  const movePost = (i: number, dir: -1 | 1) => {
    const next = i + dir;
    if (next < 0 || next >= draft.posts.length) return;
    const posts = [...draft.posts];
    [posts[i], posts[next]] = [posts[next], posts[i]];
    setDraft({ ...draft, posts });
  };

  const onSave = async () => {
    setBusy(true);
    setMsg(null);
    try {
      // Promote any in-session new posts to the top, preserving the order
      // they were added. Existing posts keep their relative order.
      const newOnes = draft.posts.filter((p) => sessionNew.has(p.id));
      const rest = draft.posts.filter((p) => !sessionNew.has(p.id));
      const reordered: BlogConfig = { ...draft, posts: [...newOnes.reverse(), ...rest] };
      await save(reordered);
      setSessionNew(new Set());
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
        <h2 className="font-serif text-3xl text-white tracking-tight">Journal — Cinematic Insights</h2>
        <p className="mt-1 text-sm text-[#A3A3A3] font-sans">
          The first three posts (top of the list) appear on the public site. All posts appear in the
          "Explore All Stories" modal. Use the arrows to reorder.
        </p>
      </header>

      <Card title={`Posts (${draft.posts.length})`} hint="Drag-equivalent: use ↑ / ↓ arrows on each card to reorder. Newest goes on top.">
        <div className="space-y-5">
          {draft.posts.map((post, i) => (
            <div
              key={post.id}
              className={`rounded-lg border bg-[var(--color-surface-2)] p-5 space-y-4 ${i < 3 ? 'border-[var(--color-gold)]/30' : 'border-[var(--color-line)]'}`}
            >
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-sans uppercase tracking-[0.18em] px-2 py-1 rounded ${i < 3 ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]' : 'bg-white/5 text-[#525252]'}`}>
                      {i < 3 ? `Live · #${i + 1} on home` : `Archive · only in modal`}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Title">
                      <Input
                        value={post.title}
                        onChange={(e) => updatePost(i, { title: e.target.value })}
                        placeholder="The Vision Behind Ashtaar Films…"
                      />
                    </Field>
                    <Field label="Category" hint="Short label, e.g. 'Vision', 'Production', 'Technical'.">
                      <Input
                        value={post.category}
                        onChange={(e) => updatePost(i, { category: e.target.value })}
                      />
                    </Field>
                    <Field
                      label="Date"
                      hint={post.date ? `Displays as: ${formatBlogDate(post.date)}` : 'Pick a date — defaults to today for new posts.'}
                    >
                      <Input
                        type="date"
                        max={todayIsoDate()}
                        value={toIsoDate(post.date) || todayIsoDate()}
                        onChange={(e) => {
                          const picked = e.target.value;
                          if (picked && picked > todayIsoDate()) return;
                          updatePost(i, { date: picked });
                        }}
                      />
                    </Field>
                    <Field label="Comments count">
                      <Input
                        type="number"
                        value={post.comments}
                        onChange={(e) => updatePost(i, { comments: Number(e.target.value) || 0 })}
                      />
                    </Field>
                  </div>

                  <Field label="Excerpt" hint="Shown on the public card and in the modal list.">
                    <Textarea
                      rows={2}
                      value={post.excerpt}
                      onChange={(e) => updatePost(i, { excerpt: e.target.value })}
                    />
                  </Field>

                  <Field label="Full content" hint="Shown inside the modal when the post is opened.">
                    <Textarea
                      rows={6}
                      value={post.content}
                      onChange={(e) => updatePost(i, { content: e.target.value })}
                    />
                  </Field>

                  <div className="pt-2 border-t border-[var(--color-line)]">
                    <p className="text-xs font-sans uppercase tracking-[0.18em] text-[#A3A3A3] mb-3 mt-4">
                      Cover media — image or video (replaces previous file)
                    </p>
                    <BlogMediaUploader
                      postId={post.id}
                      mediaPath={post.mediaPath}
                      mediaKind={post.mediaKind}
                      onChange={(mediaPath, mediaKind) => updatePost(i, { mediaPath, mediaKind })}
                    />
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-3 self-start shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => movePost(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="p-1.5 rounded text-[#A3A3A3] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePost(i, 1)}
                      disabled={i === draft.posts.length - 1}
                      aria-label="Move down"
                      className="p-1.5 rounded text-[#A3A3A3] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePost(i)}
                    className="text-[#A3A3A3] hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/5"
                    aria-label={`Remove ${post.title}`}
                    title="Remove post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addPost}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-[var(--color-line-strong)] text-[#A3A3A3] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/60 transition-colors text-sm font-sans"
          >
            <Plus size={14} /> Add post (newest goes on top)
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
              <span className="text-sm font-sans text-white">Unsaved blog changes</span>
              <div className="ml-auto flex items-center gap-3">
                <Button variant="ghost" onClick={() => { setDraft(saved); setSessionNew(new Set()); }} disabled={busy}>Discard</Button>
                <Button variant="primary" onClick={onSave} loading={busy}>Save changes</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Blog cover media uploader (image or video) ───────── */
function BlogMediaUploader({
  postId,
  mediaPath,
  mediaKind,
  onChange,
}: {
  postId: string;
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
    ? `${resolveBlogMediaUrl(mediaPath)}${previewBust ? (mediaPath.includes('?') ? `&v=${previewBust}` : `?v=${previewBust}`) : ''}`
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
      const path = `blog/post_${postId}-${Date.now()}.${ext}`;
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
        <div className="grid md:grid-cols-[200px_1fr] gap-4 items-start">
          <div className="aspect-video rounded-md overflow-hidden border border-[var(--color-line)] bg-black relative">
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
          'flex flex-col items-center justify-center gap-2 py-6 px-6 text-center cursor-pointer',
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
