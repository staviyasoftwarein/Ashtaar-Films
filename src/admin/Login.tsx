import { useState } from 'react';
import { motion } from 'motion/react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Button, Field, Input } from './components/ui';

export default function Login() {
  const { signIn } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-ink)] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vh] bg-[var(--color-gold)]/[0.04] blur-[140px] rounded-full" />
      </div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px] space-y-7"
      >
        <header className="text-center space-y-2">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'Cinzel, serif', color: '#b20710', letterSpacing: '0.04em' }}
          >
            ASHTAAR
          </h1>
          <p className="text-xs font-sans uppercase tracking-[0.3em] text-[#525252]">
            Admin · Sign in
          </p>
        </header>

        <div className="space-y-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7">
          <Field label="Username" htmlFor="username">
            <Input
              id="username"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin-ashtaar"
              required
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && (
            <div role="alert" className="text-sm text-red-400 font-sans">
              {error}
            </div>
          )}

          <Button type="submit" loading={busy} className="w-full">
            Sign in
          </Button>
        </div>

        <p className="text-center text-[10px] font-sans uppercase tracking-[0.3em] text-[#3f3f3f]">
          Authorised personnel only
        </p>
      </motion.form>
    </div>
  );
}
