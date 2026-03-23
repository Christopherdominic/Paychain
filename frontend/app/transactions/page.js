'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

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
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Transaction History</h1>

        {transactions.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const isSent = tx.senderId === user.id;
              return (
                <div key={tx.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded text-sm ${
                        isSent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isSent ? 'Sent' : 'Received'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{tx.type}</span>
                    </div>
                    <span className={`text-2xl font-bold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                      {isSent ? '-' : '+'}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-700">
                    {isSent ? 'To' : 'From'}: {isSent ? tx.receiver.email : tx.sender.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                  {tx.blockchainTxHash && (
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      Blockchain: {tx.blockchainTxHash}
                    </p>
                  )}
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                    tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
