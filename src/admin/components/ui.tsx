import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function Card({ children, className, title, hint }: { children: ReactNode; className?: string; title?: string; hint?: string }) {
  return (
    <section
      className={cx(
        'rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]',
        'p-6 md:p-8',
        className
      )}
    >
      {title && (
        <header className="mb-6">
          <h3 className="font-serif text-lg md:text-xl text-white tracking-tight">{title}</h3>
          {hint && <p className="mt-1 text-sm text-[#A3A3A3]">{hint}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading, disabled, className, children, ...rest },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 px-4 h-11 rounded-md text-sm font-sans font-medium ' +
    'transition-all duration-200 select-none focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ink)] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed';
  const styles =
    variant === 'primary'
      ? 'bg-[var(--color-gold)] text-black hover:bg-[var(--color-gold-soft)] active:scale-[0.98]'
      : variant === 'danger'
      ? 'bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60'
      : 'bg-transparent border border-[var(--color-line-strong)] text-white hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]';
  return (
    <button ref={ref} disabled={disabled || loading} className={cx(base, styles, className)} {...rest}>
      {loading && (
        <span
          aria-hidden
          className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      )}
      {children}
    </button>
  );
});

type FieldProps = {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  error?: string;
};

export function Field({ label, hint, htmlFor, children, error }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-xs font-sans uppercase tracking-[0.18em] text-[#A3A3A3]">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[#525252]">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cx(
          'w-full h-11 rounded-md bg-[var(--color-surface-2)] px-3 text-sm text-white placeholder:text-[#525252]',
          'border border-[var(--color-line)] focus:border-[var(--color-gold)]',
          'transition-colors duration-150 focus:outline-none',
          'font-sans',
          className
        )}
        {...rest}
      />
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cx(
          'w-full rounded-md bg-[var(--color-surface-2)] px-3 py-2.5 text-sm text-white placeholder:text-[#525252]',
          'border border-[var(--color-line)] focus:border-[var(--color-gold)]',
          'transition-colors duration-150 focus:outline-none font-sans leading-relaxed resize-y',
          className
        )}
        {...rest}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cx(
          'w-full h-11 rounded-md bg-[var(--color-surface-2)] px-3 text-sm text-white',
          'border border-[var(--color-line)] focus:border-[var(--color-gold)]',
          'transition-colors duration-150 focus:outline-none font-sans',
          'appearance-none bg-no-repeat bg-[right_0.75rem_center]',
          className
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A3A3A3' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
          backgroundSize: '12px',
          paddingRight: '2.25rem',
        }}
        {...rest}
      >
        {children}
      </select>
    );
  }
);

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="relative h-1.5 rounded-full bg-[var(--color-surface-2)]">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-[var(--color-gold)]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-[11px] font-mono text-[#525252]">
        <span>{min}{suffix}</span>
        <span className="text-white">{value.toFixed(step < 1 ? 2 : 0)}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'inline-flex items-center gap-4 group',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <span
        className={cx(
          'relative inline-flex w-12 h-6 shrink-0 rounded-full p-0.5 transition-colors duration-200',
          checked ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-surface-2)] border border-[var(--color-line-strong)]'
        )}
      >
        <span
          className={cx(
            'inline-block w-5 h-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-0'
          )}
        />
      </span>
      {label && (
        <span className={cx('text-sm font-sans transition-colors duration-200', checked ? 'text-[var(--color-gold)]' : 'text-[#A3A3A3]')}>
          {label}
        </span>
      )}
    </button>
  );
}

export function Toast({ kind, children }: { kind: 'success' | 'error' | 'info'; children: ReactNode }) {
  const ring =
    kind === 'success'
      ? 'border-green-500/40 bg-green-500/10 text-green-300'
      : kind === 'error'
      ? 'border-red-500/40 bg-red-500/10 text-red-300'
      : 'border-[var(--color-line-strong)] bg-[var(--color-surface)] text-white';
  return (
    <div role="status" aria-live="polite" className={cx('px-4 py-3 rounded-md border text-sm font-sans', ring)}>
      {children}
    </div>
  );
}
