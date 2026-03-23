'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
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
        const [userData, walletData] = await Promise.all([
          api.getMe(),
          api.getWallet()
        ]);

        if (userData.error || walletData.error) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          setUser(userData);
          setWallet(walletData);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PayChain</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.name}</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Wallet Balance</h3>
            <p className="text-4xl font-bold text-gray-800">${wallet?.balance?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-gray-500 mt-2">Address: {wallet?.walletAddress}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-lg shadow text-white">
            <h3 className="mb-4 text-lg">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/wallet/fund" className="block bg-white text-blue-600 px-4 py-2 rounded text-center hover:bg-gray-100 transition">
                Fund Wallet (Mock)
              </Link>
              <Link href="/wallet/fund-stripe" className="block bg-white text-purple-600 px-4 py-2 rounded text-center hover:bg-gray-100 transition">
                Fund with Stripe
              </Link>
              <Link href="/wallet/send" className="block bg-white text-blue-600 px-4 py-2 rounded text-center hover:bg-gray-100 transition">
                Send Money
              </Link>
              <Link href="/transactions" className="block bg-white text-blue-600 px-4 py-2 rounded text-center hover:bg-gray-100 transition">
                View Transactions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
