'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { AccentPill, GlassPanel, Notice, SectionEyebrow } from '@/components/ui';

const truncateHash = (hash) => `${hash.slice(0, 12)}...${hash.slice(-10)}`;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const [userData, txData] = await Promise.all([
          api.getMe(),
          api.getTransactions()
        ]);

        if (userData.error || txData.error) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          setUser(userData);
          setTransactions(txData);
        }
      } catch (err) {
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassPanel className="rounded-[28px] px-8 py-6 text-lg text-slate-700">Loading your ledger...</GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <SectionEyebrow>Unified Ledger</SectionEyebrow>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">Transaction History</h1>
          <p className="mt-2 text-slate-600">Track fintech transfers and blockchain settlements side by side.</p>
        </div>

        {transactions.length === 0 ? (
          <GlassPanel className="rounded-[28px] p-8 text-center text-slate-500">
            No transactions yet
          </GlassPanel>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const isSent = tx.senderId === user.id;
              const isCrypto = tx.type === 'crypto';
              const statusClass = tx.status === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : tx.status === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700';

              return (
                <GlassPanel key={tx.id} className="rounded-[28px] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <AccentPill tone={isSent ? 'red' : 'emerald'}>{isSent ? 'Sent' : 'Received'}</AccentPill>
                        <AccentPill tone={isCrypto ? 'violet' : 'blue'}>{isCrypto ? 'Crypto' : 'Fiat'}</AccentPill>
                        <AccentPill className={statusClass}>{tx.status}</AccentPill>
                      </div>
                      <p className="mt-4 text-sm text-slate-500">
                        {isSent ? 'To' : 'From'}: <span className="font-medium text-slate-800">{isSent ? tx.receiver.email : tx.sender.email}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-2xl font-semibold ${isSent ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isSent ? '-' : '+'}${tx.amount.toFixed(2)}
                    </span>
                  </div>

                  {tx.blockchainTxHash ? (
                    <div className="mt-5 rounded-2xl bg-slate-950 px-4 py-4 text-white">
                      <SectionEyebrow className="text-slate-400">Blockchain Hash</SectionEyebrow>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="font-mono text-sm text-violet-200">{truncateHash(tx.blockchainTxHash)}</p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.blockchainTxHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  ) : (
                    <Notice tone="blue" className="mt-5">
                      Fiat transfer processed through the traditional payment rail.
                    </Notice>
                  )}
                </GlassPanel>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
