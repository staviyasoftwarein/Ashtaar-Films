import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSetting } from '../../hooks/useSetting';
import { Button, Card, Field, Input, Textarea, Toast } from '../components/ui';

type StoryConfig = { eyebrow: string; body: string };
const DEFAULT_STORY: StoryConfig = {
  eyebrow: 'THE GENESIS OF GREAT CINEMA.',
  body: "the story of ASHTAAR begins with vision. we believe creators who've proven their artistry deserve better: better production, better storytelling, better cinema. this is the status quo we're building. make it to the screen, and experience the ascension yourself.",
};

function deepEqual<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function StoryEditor() {
  const { value: saved, loading, save } = useSetting<StoryConfig>('story', DEFAULT_STORY);
  const [draft, setDraft] = useState<StoryConfig>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setDraft(saved); }, [saved]);

  const dirty = !deepEqual(draft, saved);
  const charCount = draft.body.length;

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
        <h2 className="font-serif text-3xl text-white tracking-tight">The Story</h2>
        <p className="mt-1 text-sm text-[#A3A3A3] font-sans">
          The "Genesis of Great Cinema" page — eyebrow label and the long-form mission statement.
        </p>
      </header>

      {/* Live preview */}
      <Card title="Live preview" hint="A close approximation of how the public page will render.">
        <div className="relative rounded-xl overflow-hidden bg-[#080808] border border-[var(--color-line)] p-8 md:p-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square rounded-full bg-[#b20710] blur-[120px] opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h3 className="text-[#D4AF37] uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 font-sans font-bold flex items-center gap-3">
              <span className="w-6 h-[1px] bg-[#D4AF37]" />
              {draft.eyebrow || DEFAULT_STORY.eyebrow}
            </h3>
            <p className="font-serif text-xl md:text-3xl leading-[1.3] tracking-tight text-white whitespace-pre-line">
              {draft.body || DEFAULT_STORY.body}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Genesis" hint="Above the body — small gold eyebrow label.">
        <Field label="Eyebrow">
          <Input
            value={draft.eyebrow}
            onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })}
            placeholder="THE GENESIS OF GREAT CINEMA."
          />
        </Field>
      </Card>

      <Card title="Body" hint={`The long-form serif paragraph. Line breaks are preserved on the public page. ${charCount} characters.`}>
        <Field label="Mission statement">
          <Textarea
            rows={8}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder="the story of ASHTAAR begins with vision…"
          />
        </Field>
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
              <span className="text-sm font-sans text-white">Unsaved story changes</span>
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
