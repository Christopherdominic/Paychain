'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { GlassPanel, IconTile, Notice, PrimaryButton, SectionEyebrow } from '@/components/ui';

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6z" />
    <path d="m9.5 12 1.7 1.7L14.8 10" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      
      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.8fr_1fr]">
        <GlassPanel className="rounded-[32px] p-8">
          <SectionEyebrow>Secure Access</SectionEyebrow>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Return to your hybrid wallet.</h1>
          <p className="mt-4 text-slate-600">
            Resume OTP-protected fiat transfers and blockchain-traceable activity from a single authenticated workspace.
          </p>
          <div className="mt-8 rounded-2xl bg-blue-50 p-4 text-blue-700">
            <div className="flex items-center gap-3">
              <IconTile tone="blue">
                <ShieldIcon />
              </IconTile>
              <div>
                <p className="font-semibold">Protected session</p>
                <p className="text-sm text-blue-600">Your wallet, transfer history, and security state stay behind authenticated access.</p>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="rounded-[32px] p-8">
          {error && (
            <Notice tone="red" className="mb-5">{error}</Notice>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </div>

            <PrimaryButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Enter Dashboard'}
            </PrimaryButton>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-slate-900 underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
