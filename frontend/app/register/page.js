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

const ChainIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9.5 14.5 7 17a3 3 0 1 1-4.2-4.2l2.8-2.8A3 3 0 0 1 9.9 10" />
    <path d="m14.5 9.5 2.5-2.5a3 3 0 0 1 4.2 4.2l-2.8 2.8a3 3 0 0 1-4.3-.2" />
    <path d="m8 16 8-8" />
  </svg>
);

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.register({ name, email, password, phone });
      
      if (data.error) {
        setError(data.message || data.error);
      } else {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <GlassPanel className="rounded-[32px] p-8">
          <SectionEyebrow>Create Account</SectionEyebrow>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Create your PayChain account.</h1>
          <p className="mt-4 text-slate-600">
            Sign up with your core details and get a wallet provisioned immediately for payments and blockchain activity.
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
              <div className="flex items-center gap-3">
                <IconTile tone="blue">
                  <ShieldIcon />
                </IconTile>
                <div>
                  <p className="font-semibold">Fintech-grade onboarding</p>
                  <p className="text-sm text-blue-600">Simple onboarding keeps registration fast while preserving secure account access.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4 text-violet-700">
              <div className="flex items-center gap-3">
                <IconTile tone="violet">
                  <ChainIcon />
                </IconTile>
                <div>
                  <p className="font-semibold">Web3-ready wallet</p>
                  <p className="text-sm text-violet-600">A wallet address is created immediately for blockchain activity.</p>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="rounded-[32px] p-8">
          {error && (
            <Notice tone="red" className="mb-5">{error}</Notice>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                  required
                />
              </div>
            </div>

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
              {loading ? 'Creating Account...' : 'Create PayChain Account'}
            </PrimaryButton>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-slate-900 underline-offset-4 hover:underline">
              Login
            </Link>
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
