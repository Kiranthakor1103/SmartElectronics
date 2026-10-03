'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    let user = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) user = JSON.parse(stored);
    } catch {
      user = null;
    }

    if (token && user && user.role === 'admin') {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-300 font-semibold text-sm gap-3">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-2xl shadow-xl shadow-blue-500/25 animate-pulse">
        <Zap className="w-7 h-7 text-cyan-200 fill-current" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-sm font-black text-white tracking-wider uppercase">
          Smart<span className="text-cyan-400">Electronics</span> Admin
        </h2>
        <p className="text-xs text-slate-400 font-medium">Entering Control Console...</p>
      </div>
    </div>
  );
}
