import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useSetting } from '../../hooks/useSetting';
import {
  DEFAULT_INVESTMENT,
  type InvestmentConfig,
  type InvestmentTier,
} from '../../lib/investment';
import { Button, Card, Field, Input, Textarea, Toast, Toggle } from '../components/ui';

function deepEqual<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function newTierId(existing: InvestmentTier[]): string {
  const nums = existing
    .map((t) => Number(t.id))
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1);
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function InvestmentEditor() {
  const { value: saved, loading, save } = useSetting<InvestmentConfig>(
    'investment',
    DEFAULT_INVESTMENT
  );
  const [draft, setDraft] = useState<InvestmentConfig>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const dirty = !deepEqual(draft, saved);

  const updateTier = (i: number, patch: Partial<InvestmentTier>) => {
    const tiers = draft.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    setDraft({ ...draft, tiers });
  };

  const removeTier = (i: number) => {
    const tiers = draft.tiers.filter((_, idx) => idx !== i).map((t, idx) => ({
      ...t,
      num: pad2(idx + 1),
    }));
    setDraft({ ...draft, tiers });
  };

  const addTier = () => {
    const id = newTierId(draft.tiers);
    const next: InvestmentTier = {
      id,
      num: pad2(draft.tiers.length + 1),
      title: 'NEW TIER',
      price: '₹—',
      subtitle: 'Short tagline for this tier.',
      benefits: ['Benefit one', 'Benefit two'],
      btnText: 'BUILD TOMORROW, TODAY!',
      isDark: false,
    };
    setDraft({ ...draft, tiers: [...draft.tiers, next] });
  };

  const moveTier = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.tiers.length) return;
    const tiers = [...draft.tiers];
    [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
    const renum = tiers.map((t, idx) => ({ ...t, num: pad2(idx + 1) }));
    setDraft({ ...draft, tiers: renum });
  };

  const focusKeyRef = useRef<string | null>(null);

  const setBenefits = (tierIdx: number, benefits: string[]) => {
    updateTier(tierIdx, { benefits });
  };

  const updateBenefitAt = (tierIdx: number, bIdx: number, val: string) => {
    const next = draft.tiers[tierIdx].benefits.slice();
    next[bIdx] = val;
    setBenefits(tierIdx, next);
  };

  const insertBenefitAfter = (tierIdx: number, bIdx: number) => {
    const arr = draft.tiers[tierIdx].benefits.slice();
    arr.splice(bIdx + 1, 0, '');
    setBenefits(tierIdx, arr);
    focusKeyRef.current = `${draft.tiers[tierIdx].id}:${bIdx + 1}`;
  };

  const removeBenefitAt = (tierIdx: number, bIdx: number) => {
    const arr = draft.tiers[tierIdx].benefits.slice();
    if (arr.length <= 1) {
      arr[0] = '';
      setBenefits(tierIdx, arr);
      return;
    }
    arr.splice(bIdx, 1);
    setBenefits(tierIdx, arr);
    const prev = Math.max(0, bIdx - 1);
    focusKeyRef.current = `${draft.tiers[tierIdx].id}:${prev}`;
  };

  const addBenefit = (tierIdx: number) => {
    const arr = [...draft.tiers[tierIdx].benefits, ''];
    setBenefits(tierIdx, arr);
    focusKeyRef.current = `${draft.tiers[tierIdx].id}:${arr.length - 1}`;
  };

  const onSave = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const cleaned: InvestmentConfig = {
        ...draft,
        tiers: draft.tiers.map((t) => ({
          ...t,
          benefits: t.benefits.map((b) => b.trim()).filter((b) => b.length > 0),
        })),
      };
      await save(cleaned);
      setDraft(cleaned);
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
        <h2 className="font-serif text-3xl text-white tracking-tight">Investment</h2>
        <p className="mt-1 text-sm text-[#A3A3A3] font-sans">
          The left-side hero copy, the CTA, and the tier cards on the right.
        </p>
      </header>

      <Card title="Left panel copy" hint="Eyebrow, big heading, and the italic blockquote underneath.">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Eyebrow" hint="Small gold uppercase label above the heading.">
            <Input
              value={draft.eyebrow}
              onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })}
              placeholder="Investment"
            />
          </Field>
          <Field label="WhatsApp number" hint="Used for the 'BUILD TOMORROW' WhatsApp inquiry links. Include country code.">
            <Input
              value={draft.whatsappNumber || DEFAULT_INVESTMENT.whatsappNumber}
              onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
              placeholder="+91 70963 60360"
            />
          </Field>
          <Field label="Heading – line 1" hint="Plain uppercase line.">
            <Input
              value={draft.headingLine1}
              onChange={(e) => setDraft({ ...draft, headingLine1: e.target.value })}
              placeholder="Don't watch the future,"
            />
          </Field>
          <Field label="Heading – line 2" hint="Italic gold serif line.">
            <Input
              value={draft.headingLine2}
              onChange={(e) => setDraft({ ...draft, headingLine2: e.target.value })}
              placeholder="Shape it!"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Blockquote" hint="Italic sentence under the heading.">
              <Textarea
                value={draft.blockquote}
                onChange={(e) => setDraft({ ...draft, blockquote: e.target.value })}
                placeholder='"Three investment tiers. One shared vision..."'
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Right panel CTA" hint="Shown before the tiers are revealed.">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="CTA heading">
            <Input
              value={draft.ctaHeading}
              onChange={(e) => setDraft({ ...draft, ctaHeading: e.target.value })}
              placeholder="Your legacy begins behind the camera."
            />
          </Field>
          <Field label="CTA button label">
            <Input
              value={draft.ctaButton}
              onChange={(e) => setDraft({ ...draft, ctaButton: e.target.value })}
              placeholder="Ready to build tomorrow, today?"
            />
          </Field>
        </div>
      </Card>

      <Card
        title={`Tiers (${draft.tiers.length})`}
        hint="Add, reorder, or remove tier cards. Toggle the dark style per card."
      >
        <div className="space-y-5">
          {draft.tiers.map((t, i) => (
            <div
              key={t.id}
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#A3A3A3]">
                    Tier {t.num}
                  </span>
                  <div
                    className={`text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-1 rounded ${
                      t.isDark ? 'bg-black text-white border border-white/20' : 'bg-white text-black'
                    }`}
                  >
                    {t.isDark ? 'Black card' : 'White card'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveTier(i, -1)}
                    disabled={i === 0}
                    className="p-2 rounded-md text-[#A3A3A3] hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTier(i, 1)}
                    disabled={i === draft.tiers.length - 1}
                    className="p-2 rounded-md text-[#A3A3A3] hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTier(i)}
                    className="p-2 rounded-md text-[#A3A3A3] hover:text-red-400 hover:bg-red-500/5"
                    aria-label={`Remove tier ${t.num}`}
                    title="Remove tier"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Title">
                  <Input
                    value={t.title}
                    onChange={(e) => updateTier(i, { title: e.target.value })}
                    placeholder="ASSOCIATE PRODUCER"
                  />
                </Field>
                <Field label="Price">
                  <Input
                    value={t.price}
                    onChange={(e) => updateTier(i, { price: e.target.value })}
                    placeholder="₹10 Lakh+"
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Subtitle">
                    <Input
                      value={t.subtitle}
                      onChange={(e) => updateTier(i, { subtitle: e.target.value })}
                      placeholder="Your first step into cinema ownership."
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Benefits" hint="Press Enter for a new point. Backspace on an empty point removes it.">
                    <div className="space-y-2">
                      {t.benefits.map((b, bi) => (
                        <BenefitRow
                          key={`${t.id}:${bi}`}
                          autoFocusKey={`${t.id}:${bi}`}
                          focusKeyRef={focusKeyRef}
                          index={bi}
                          value={b}
                          onChange={(v) => updateBenefitAt(i, bi, v)}
                          onEnter={() => insertBenefitAfter(i, bi)}
                          onRemove={() => removeBenefitAt(i, bi)}
                          isOnlyEmpty={t.benefits.length === 1 && b === ''}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => addBenefit(i)}
                        className="inline-flex items-center gap-2 text-xs font-sans text-[#A3A3A3] hover:text-[var(--color-gold)] transition-colors"
                      >
                        <Plus size={12} /> Add benefit
                      </button>
                    </div>
                  </Field>
                </div>
                <Field label="Button label">
                  <Input
                    value={t.btnText}
                    onChange={(e) => updateTier(i, { btnText: e.target.value })}
                    placeholder="BUILD TOMORROW, TODAY!"
                  />
                </Field>
                <Field label="Badge" hint="Optional. e.g. MOST POPULAR. Leave blank for no badge.">
                  <Input
                    value={t.badge ?? ''}
                    onChange={(e) =>
                      updateTier(i, { badge: e.target.value.trim() ? e.target.value : undefined })
                    }
                    placeholder="MOST POPULAR"
                  />
                </Field>
                <div className="md:col-span-2 pt-2">
                  <Toggle
                    checked={t.isDark}
                    onChange={(v) => updateTier(i, { isDark: v })}
                    label={t.isDark ? 'Dark (black) card style' : 'Light (white) card style'}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addTier}
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md border border-dashed border-[var(--color-line-strong)] text-sm font-sans text-[#A3A3A3] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors"
          >
            <Plus size={14} /> Add tier
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
              <span className="text-sm font-sans text-white">Unsaved investment changes</span>
              <div className="ml-auto flex items-center gap-3">
                <Button variant="ghost" onClick={() => setDraft(saved)} disabled={busy}>
                  Discard
                </Button>
                <Button variant="primary" onClick={onSave} loading={busy}>
                  Save changes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type BenefitRowProps = {
  index: number;
  value: string;
  autoFocusKey: string;
  focusKeyRef: React.MutableRefObject<string | null>;
  onChange: (v: string) => void;
  onEnter: () => void;
  onRemove: () => void;
  isOnlyEmpty: boolean;
};

function BenefitRow({
  index,
  value,
  autoFocusKey,
  focusKeyRef,
  onChange,
  onEnter,
  onRemove,
  isOnlyEmpty,
}: BenefitRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusKeyRef.current === autoFocusKey) {
      inputRef.current?.focus();
      focusKeyRef.current = null;
    }
  }, [autoFocusKey, focusKeyRef, value]);

  return (
    <div className="flex items-center gap-2 group">
      <span className="w-6 shrink-0 text-right font-mono text-xs text-[var(--color-gold)] select-none">
        {index + 1}.
      </span>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onEnter();
          } else if (e.key === 'Backspace' && value === '' && !isOnlyEmpty) {
            e.preventDefault();
            onRemove();
          }
        }}
        placeholder={`Benefit ${index + 1}`}
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={isOnlyEmpty}
        className="p-2 rounded-md text-[#525252] hover:text-red-400 hover:bg-red-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label={`Remove benefit ${index + 1}`}
        title="Remove benefit"
      >
        <X size={14} />
      </button>
    </div>
  );
}
