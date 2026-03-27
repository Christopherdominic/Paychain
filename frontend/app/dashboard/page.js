'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { AccentPill, GlassPanel, IconTile, SectionEyebrow } from '@/components/ui';

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h10A2.5 2.5 0 0 1 18 7.5v1H7.5A2.5 2.5 0 0 0 5 11v5.5A2.5 2.5 0 0 0 7.5 19H18v.5a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 3 19.5z" />
    <path d="M19 8.5h-9.5A1.5 1.5 0 0 0 8 10v6a1.5 1.5 0 0 0 1.5 1.5H19A2 2 0 0 0 21 15.5v-5A2 2 0 0 0 19 8.5Z" />
    <circle cx="16" cy="13" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m4 12 15-7-4 7 4 7-15-7Z" />
    <path d="M15 12H7" />
  </svg>
);

const ChainIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9.5 14.5 7 17a3 3 0 1 1-4.2-4.2l2.8-2.8A3 3 0 0 1 9.9 10" />
    <path d="m14.5 9.5 2.5-2.5a3 3 0 0 1 4.2 4.2l-2.8 2.8a3 3 0 0 1-4.3-.2" />
    <path d="m8 16 8-8" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6z" />
    <path d="m9.5 12 1.7 1.7L14.8 10" />
  </svg>
);

const formatHash = (hash) => {
  if (!hash) return 'No blockchain activity yet';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
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
        const [userData, walletData, transactionData] = await Promise.all([
          api.getMe(),
          api.getWallet(),
          api.getTransactions()
        ]);

        if (userData.error || walletData.error || transactionData.error) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          setUser(userData);
          setWallet(walletData);
          setTransactions(transactionData);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const cryptoTransactions = transactions.filter((tx) => tx.type === 'crypto');
  const fiatTransactions = transactions.filter((tx) => tx.type !== 'crypto');
  const lastCryptoHash = cryptoTransactions.find((tx) => tx.blockchainTxHash)?.blockchainTxHash;
  const recentTransactions = transactions.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassPanel className="rounded-[28px] px-8 py-6 text-lg text-slate-700">Loading your payment rails...</GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Hybrid Payments</p>
            <h1 className="text-2xl font-bold text-slate-900">PayChain</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <GlassPanel className="relative overflow-hidden rounded-[32px] px-6 py-8 md:px-8">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-violet-500/10 to-transparent md:block" />
          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <SectionEyebrow className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1 text-white">
                <ShieldIcon />
                Verified fintech + web3 rails
              </SectionEyebrow>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Move between bank-grade transfers and on-chain settlement in one wallet.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Send fiat with OTP security through Interswitch or route crypto through blockchain rails with transparent hash tracking.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/wallet/send" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  <SendIcon />
                  Launch transfer flow
                </Link>
                <Link href="/transactions" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
                  <ChainIcon />
                  Inspect transactions
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <SectionEyebrow className="text-slate-400">Wallet Balance</SectionEyebrow>
                  <p className="mt-3 text-4xl font-semibold">${wallet?.balance?.toFixed(2) || '0.00'}</p>
                </div>
                <IconTile className="bg-white/10 text-cyan-200">
                  <WalletIcon />
                </IconTile>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <SectionEyebrow className="text-slate-400">Wallet Address</SectionEyebrow>
                <p className="mt-2 break-all font-mono text-sm text-slate-100">{wallet?.walletAddress}</p>
              </div>
            </div>
          </div>
        </GlassPanel>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 md:grid-cols-2">
            <GlassPanel className="rounded-[28px] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Fiat Activity</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{fiatTransactions.length}</p>
                  <p className="mt-2 text-sm text-slate-600">OTP-backed transfers routed through traditional payment rails.</p>
                </div>
                <IconTile tone="blue">
                  <ShieldIcon />
                </IconTile>
              </div>
            </GlassPanel>

            <GlassPanel className="rounded-[28px] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Crypto Activity</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{cryptoTransactions.length}</p>
                  <p className="mt-2 text-sm text-slate-600">On-chain transfers with explorer-ready hashes and settlement visibility.</p>
                </div>
                <IconTile tone="violet">
                  <ChainIcon />
                </IconTile>
              </div>
            </GlassPanel>
          </div>

          <GlassPanel className="rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Latest Crypto Hash</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formatHash(lastCryptoHash)}</p>
              </div>
              <IconTile tone="violet">
                <ChainIcon />
              </IconTile>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {lastCryptoHash ? 'Most recent blockchain transfer is ready for explorer lookup.' : 'Make a crypto transfer to start building on-chain history.'}
            </p>
            {lastCryptoHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${lastCryptoHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
              >
                View on Explorer
              </a>
            )}
          </GlassPanel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="rounded-[28px] p-6">
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            <div className="mt-5 space-y-3">
              <Link href="/wallet/fund" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50">
                <div>
                  <p className="font-semibold text-slate-900">Fund wallet</p>
                  <p className="text-sm text-slate-500">Top up and prepare for fiat or crypto transfers.</p>
                </div>
                <IconTile tone="blue">
                  <WalletIcon />
                </IconTile>
              </Link>
              <Link href="/wallet/send" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-violet-200 hover:bg-violet-50">
                <div>
                  <p className="font-semibold text-slate-900">Send money</p>
                  <p className="text-sm text-slate-500">Switch between OTP-protected fiat and blockchain rails.</p>
                </div>
                <IconTile tone="violet">
                  <SendIcon />
                </IconTile>
              </Link>
              <Link href="/transactions" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-900">View transaction ledger</p>
                  <p className="text-sm text-slate-500">Audit statuses, hashes, and routing type at a glance.</p>
                </div>
                <IconTile tone="slate">
                  <ChainIcon />
                </IconTile>
              </Link>
            </div>
          </GlassPanel>

          <GlassPanel className="rounded-[28px] p-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <p className="text-sm text-slate-500">See how fiat and blockchain transfers differ in one stream.</p>
            <div className="mt-5 space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-5 py-8 text-center text-sm text-slate-500">
                  No payments yet. Start with a fiat or crypto transfer to populate your hybrid ledger.
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const isCrypto = tx.type === 'crypto';
                  return (
                    <div key={tx.id} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <AccentPill tone={isCrypto ? 'violet' : 'blue'}>{isCrypto ? 'Crypto' : 'Fiat'}</AccentPill>
                            <span className="text-sm text-slate-500">{tx.status}</span>
                          </div>
                          <p className="mt-2 font-semibold text-slate-900">${tx.amount.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {tx.senderId === user.id ? `To ${tx.receiver.email}` : `From ${tx.sender.email}`}
                      </p>
                      {tx.blockchainTxHash && (
                        <p className="mt-2 font-mono text-xs text-violet-600">{formatHash(tx.blockchainTxHash)}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </GlassPanel>
        </section>
      </div>
    </div>
  );
}
