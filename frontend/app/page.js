import Link from 'next/link';
import { GlassPanel, IconTile, PrimaryButton, SecondaryLink, SectionEyebrow } from '@/components/ui';

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

const ChainIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9.5 14.5 7 17a3 3 0 1 1-4.2-4.2l2.8-2.8A3 3 0 0 1 9.9 10" />
    <path d="m14.5 9.5 2.5-2.5a3 3 0 0 1 4.2 4.2l-2.8 2.8a3 3 0 0 1-4.3-.2" />
    <path d="m8 16 8-8" />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <GlassPanel className="overflow-hidden rounded-[36px] px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <SectionEyebrow className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-white">
                Next-generation hybrid payments
              </SectionEyebrow>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 md:text-6xl">
                One platform for bank-grade payments and blockchain-native transfers.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                PayChain combines Interswitch-backed fiat flows, OTP verification, and blockchain transparency in a single wallet experience.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register">
                  <PrimaryButton>Create Account</PrimaryButton>
                </Link>
                <SecondaryLink href="/login">Login</SecondaryLink>
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20">
              <SectionEyebrow className="text-slate-400">Payment rails</SectionEyebrow>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <IconTile className="bg-blue-500/15 text-blue-300">
                      <ShieldIcon />
                    </IconTile>
                    <div>
                      <p className="font-semibold">Fiat</p>
                      <p className="text-sm text-slate-400">OTP-secured transfers powered by Interswitch</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <IconTile className="bg-violet-500/15 text-violet-300">
                      <ChainIcon />
                    </IconTile>
                    <div>
                      <p className="font-semibold">Crypto</p>
                      <p className="text-sm text-slate-400">Hash-tracked blockchain transfers with explorer visibility</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <IconTile className="bg-cyan-500/15 text-cyan-300">
                      <WalletIcon />
                    </IconTile>
                    <div>
                      <p className="font-semibold">Unified Wallet</p>
                      <p className="text-sm text-slate-400">One balance hub for fintech and web3 payment activity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
