'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '@/lib/api';
import Link from 'next/link';
import { GlassPanel, IconTile, Notice, PrimaryButton, SectionEyebrow } from '@/components/ui';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const CardIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required'
      });

      if (submitError) {
        setError(submitError.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <PrimaryButton
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </PrimaryButton>
      {error && (
        <Notice tone="red">{error}</Notice>
      )}
    </form>
  );
}

export default function FundWalletStripe() {
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const handleAmountSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await api.createStripePayment(parseFloat(amount));
      
      if (data.error) {
        setError(data.error);
      } else {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      }
    } catch (err) {
      setError('Failed to initialize payment');
    }
  };

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="rounded-[32px] p-8">
            <SectionEyebrow>Card Funding</SectionEyebrow>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">Use Stripe for direct top-ups.</h1>
            <p className="mt-4 text-slate-600">
              This flow is ideal when you want a faster card-based funding option while keeping the PayChain wallet as your single balance source.
            </p>
            <div className="mt-8 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <IconTile className="bg-white/10 text-cyan-200">
                  <CardIcon />
                </IconTile>
                <div>
                  <p className="font-semibold">Secure checkout</p>
                  <p className="text-sm text-slate-400">Card details stay inside Stripe Elements while PayChain records the resulting wallet credit.</p>
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="rounded-[32px] p-8">
            {error && (
              <Notice tone="red" className="mb-5">{error}</Notice>
            )}

            {!showPayment ? (
              <form onSubmit={handleAmountSubmit} className="space-y-4">
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
                  className="w-full"
                >
                  Continue to Payment
                </PrimaryButton>
              </form>
            ) : (
              clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm amount={amount} onSuccess={handleSuccess} />
                </Elements>
              )
            )}

            <p className="mt-5 text-center text-sm text-slate-500">
              Secure payment powered by Stripe
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
