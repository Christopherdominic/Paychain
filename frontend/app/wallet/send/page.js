'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { AccentPill, GlassPanel, IconTile, Notice, PrimaryButton, SecondaryLink, SectionEyebrow } from '@/components/ui';

const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m4 12 15-7-4 7 4 7-15-7Z" />
    <path d="M15 12H7" />
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

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="9" y="9" width="10" height="10" rx="2" />
    <path d="M5 15V7a2 2 0 0 1 2-2h8" />
  </svg>
);

export default function SendMoney() {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('fiat');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const submitTransfer = async (payload) => {
    setLoading(true);

    try {
      const data = await api.sendMoney(payload);

      if (data.error) {
        setError(data.error);
      } else if (data.requiresOtp) {
        setAwaitingOtp(true);
        setSessionId(data.sessionId);
        setSuccess(data.message);
      } else {
        const txHash = data.transaction?.blockchainTxHash || null;
        setResult({
          type: payload.type,
          amount: payload.amount,
          receiverEmail: payload.receiverEmail,
          txHash
        });
        setSuccess(payload.type === 'crypto' ? 'Blockchain transaction submitted successfully!' : 'Fiat transfer completed successfully!');
        setReceiverEmail('');
        setAmount('');
        setOtp('');
        setSessionId('');
        setAwaitingOtp(false);
      }
    } catch (err) {
      setError('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setResult(null);

    const payload = {
      receiverEmail,
      amount: parseFloat(amount),
      type,
      sessionId: awaitingOtp ? sessionId : undefined,
      otp: awaitingOtp ? otp : undefined
    };

    if (type === 'crypto' && !awaitingOtp) {
      setShowConfirmModal(true);
      return;
    }

    await submitTransfer(payload);
  };

  const handleCryptoConfirm = async () => {
    setShowConfirmModal(false);
    await submitTransfer({
      receiverEmail,
      amount: parseFloat(amount),
      type: 'crypto'
    });
  };

  const copyHash = async () => {
    if (!result?.txHash) return;
    await navigator.clipboard.writeText(result.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isCrypto = type === 'crypto';
  const explorerLink = result?.txHash ? `https://sepolia.etherscan.io/tx/${result.txHash}` : null;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <GlassPanel className="rounded-[32px] p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <SectionEyebrow>Hybrid Transfer</SectionEyebrow>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Send money with the right rail</h1>
                <p className="mt-2 text-slate-600">Fiat uses OTP-protected Interswitch flows. Crypto shows a blockchain-first confirmation and hash trail.</p>
              </div>
              <AccentPill tone={isCrypto ? 'violet' : 'blue'} className="rounded-3xl px-4 py-3 text-sm normal-case tracking-normal">
                {isCrypto ? 'Blockchain mode' : 'Fiat mode'}
              </AccentPill>
            </div>

            <div className="mt-8 rounded-[28px] bg-slate-100 p-2">
              <div className="grid gap-2 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('fiat');
                    setAwaitingOtp(false);
                    setOtp('');
                    setSessionId('');
                    setResult(null);
                    resetMessages();
                  }}
                  className={`rounded-[22px] px-5 py-4 text-left transition ${!isCrypto ? 'bg-white shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:bg-white/70'}`}
                >
                  <div className="flex items-center gap-3">
                    <IconTile tone="blue">
                      <ShieldIcon />
                    </IconTile>
                    <div>
                      <p className="font-semibold text-slate-900">Fiat</p>
                      <p className="text-sm text-slate-500">Interswitch + OTP security</p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('crypto');
                    setAwaitingOtp(false);
                    setOtp('');
                    setSessionId('');
                    setResult(null);
                    resetMessages();
                  }}
                  className={`rounded-[22px] px-5 py-4 text-left transition ${isCrypto ? 'bg-white shadow-sm ring-1 ring-violet-200' : 'text-slate-500 hover:bg-white/70'}`}
                >
                  <div className="flex items-center gap-3">
                    <IconTile tone="violet">
                      <ChainIcon />
                    </IconTile>
                    <div>
                      <p className="font-semibold text-slate-900">Crypto</p>
                      <p className="text-sm text-slate-500">Blockchain settlement + tx hash</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {error && <Notice tone="red" className="mt-6">{error}</Notice>}

            {success && <Notice tone="emerald" className="mt-6">{success}</Notice>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Recipient Email</label>
                <input
                  type="email"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                  required
                />
              </div>

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

              {awaitingOtp && !isCrypto && (
                <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-center gap-3">
                    <IconTile tone="blue">
                      <ShieldIcon />
                    </IconTile>
                    <div>
                      <p className="font-semibold text-slate-900">OTP Verification Required</p>
                      <p className="text-sm text-slate-600">Enter the code sent to your registered phone to release this fiat transfer.</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 outline-none transition focus:border-blue-400"
                      required
                    />
                  </div>
                </div>
              )}

              <PrimaryButton
                type="submit"
                disabled={loading}
                className={`inline-flex w-full items-center justify-center gap-2 py-4 ${isCrypto ? 'bg-violet-600 hover:bg-violet-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <SendIcon />
                {loading
                  ? isCrypto
                    ? 'Processing blockchain transaction...'
                    : 'Processing fiat transfer...'
                  : awaitingOtp && !isCrypto
                    ? 'Verify OTP & Complete'
                    : isCrypto
                      ? 'Review Blockchain Transfer'
                      : 'Send with OTP'}
              </PrimaryButton>
            </form>
          </GlassPanel>

          <div className="space-y-6">
            <GlassPanel className={`rounded-[32px] p-6 ${isCrypto ? 'ring-1 ring-violet-200' : 'ring-1 ring-blue-200'}`}>
              <div className="flex items-center gap-3">
                <IconTile tone={isCrypto ? 'violet' : 'blue'}>
                  {isCrypto ? <ChainIcon /> : <ShieldIcon />}
                </IconTile>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{isCrypto ? 'Blockchain Rail' : 'Fiat Rail'}</h2>
                  <p className="text-sm text-slate-500">
                    {isCrypto ? 'Transparent settlement with explorer-linked hash visibility.' : 'OTP-confirmed transfer with fintech-grade trust signals.'}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  {isCrypto ? 'You will review the transfer in a confirmation modal before it is submitted to the blockchain rail.' : 'Submitting starts an OTP step. The transfer completes only after the verification code is confirmed.'}
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  {isCrypto ? 'Successful sends surface a transaction hash, copy action, and explorer link so users can audit the payment path.' : 'Fiat sends emphasize recipient, amount, and security checks rather than on-chain metadata.'}
                </div>
              </div>
            </GlassPanel>

            {result?.txHash && (
              <GlassPanel className="rounded-[32px] p-6">
                <div className="flex items-center gap-3">
                  <IconTile tone="violet">
                    <ChainIcon />
                  </IconTile>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Blockchain Receipt</h2>
                    <p className="text-sm text-slate-500">Use this hash to verify settlement outside the app.</p>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
                  <SectionEyebrow className="text-slate-400">Transaction Hash</SectionEyebrow>
                  <p className="mt-3 break-all font-mono text-sm">{result.txHash}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <PrimaryButton
                    type="button"
                    onClick={copyHash}
                    className="inline-flex items-center gap-2 border border-slate-200 bg-white py-2 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                  >
                    <CopyIcon />
                    {copied ? 'Copied' : 'Copy Hash'}
                  </PrimaryButton>
                  <SecondaryLink
                    href={explorerLink}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-violet-600 py-2 text-white hover:border-violet-600 hover:bg-violet-700 hover:text-white"
                  >
                    View on Explorer
                  </SecondaryLink>
                </div>
              </GlassPanel>
            )}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <IconTile tone="violet">
                <ChainIcon />
              </IconTile>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Confirm blockchain transfer</h2>
                <p className="text-sm text-slate-500">This action will create a blockchain transaction record.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Recipient:</span> {receiverEmail}</p>
              <p className="mt-2"><span className="font-semibold text-slate-900">Amount:</span> ${amount || '0.00'}</p>
              <p className="mt-2">A transaction hash will be generated after confirmation.</p>
            </div>
            <div className="mt-6 flex gap-3">
              <PrimaryButton
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900"
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                type="button"
                onClick={handleCryptoConfirm}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                Confirm & Send
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
