'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { GlassPanel, IconTile, Notice, PrimaryButton, SectionEyebrow } from '@/components/ui';

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h10A2.5 2.5 0 0 1 18 7.5v1H7.5A2.5 2.5 0 0 0 5 11v5.5A2.5 2.5 0 0 0 7.5 19H18v.5a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 3 19.5z" />
    <path d="M19 8.5h-9.5A1.5 1.5 0 0 0 8 10v6a1.5 1.5 0 0 0 1.5 1.5H19A2 2 0 0 0 21 15.5v-5A2 2 0 0 0 19 8.5Z" />
    <circle cx="16" cy="13" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6z" />
    <path d="m9.5 12 1.7 1.7L14.8 10" />
  </svg>
);

export default function FundWallet() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await api.fundWallet(parseFloat(amount));
      
      if (data.error) {
        setError(data.error);
      } else {
        const status = data.authorizationUrl
          ? `Reference: ${data.reference}. Auth URL: ${data.authorizationUrl}`
          : `Reference: ${data.reference}`;
        setSuccess(`Wallet funded successfully! ${status}`);
        setAmount('');
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err) {
      setError('Failed to fund wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <GlassPanel className="rounded-[32px] p-8">
            <SectionEyebrow>Wallet Funding</SectionEyebrow>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">Top up your hybrid balance.</h1>
            <p className="mt-4 text-slate-600">
              Add funds before routing payments through fiat or blockchain rails. In sandbox mode, funding is simulated while preserving the transaction record.
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
                <div className="flex items-center gap-3">
                  <IconTile tone="blue">
                    <WalletIcon />
                  </IconTile>
                  <div>
                    <p className="font-semibold">Unified balance</p>
                    <p className="text-sm text-blue-600">Fund once, then use the same wallet for fiat and crypto transfers.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4 text-slate-700">
                <div className="flex items-center gap-3">
                  <IconTile tone="white">
                    <ShieldIcon />
                  </IconTile>
                  <div>
                    <p className="font-semibold">Sandbox-safe testing</p>
                    <p className="text-sm text-slate-600">Funding responses still capture references and provider metadata for debugging.</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="rounded-[32px] p-8">
            {error && (
              <Notice tone="red" className="mb-5">{error}</Notice>
            )}

            {success && (
              <Notice tone="emerald" className="mb-5">{success}</Notice>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                  required
                />
              </div>

              <PrimaryButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processing funding...' : 'Fund Wallet'}
              </PrimaryButton>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Interswitch sandbox funding flow
            </p>
            <p className="mt-2 text-center text-sm text-slate-500">
              Need card-based top up?{' '}
              <Link href="/wallet/fund-stripe" className="font-semibold text-slate-900 underline-offset-4 hover:underline">
                Use Stripe checkout
              </Link>
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
