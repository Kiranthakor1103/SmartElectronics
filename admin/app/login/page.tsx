'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, Zap } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      }

      if (!res.ok || !data || !data.success) {
        const fallbackMsg = res.status >= 500
          ? 'Backend server temporarily unavailable. Please verify backend is running on port 5000.'
          : `Login failed (${res.status} ${res.statusText || 'Bad Request'})`;
        toast(data?.message || fallbackMsg, 'error');
        setLoading(false);
        return;
      }

      const { user, token } = data.data;

      if (user.role !== 'admin') {
        toast(`Access Denied: Account role '${user.role}' is not an Admin.`, 'error');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('adminToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      document.cookie = `adminToken=${token}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

      window.dispatchEvent(new Event('auth-change'));

      toast('Welcome Admin! Authenticated successfully.', 'success');
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    } catch (err: any) {
      toast('Network or connection error connecting to auth server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/30 mx-auto mb-3">
          <Zap className="w-7 h-7 text-cyan-200 fill-current" />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Smart<span className="text-blue-600">Electronics</span>
          </h2>
          <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 px-1.5 py-0.5 rounded-md">
            ADMIN
          </span>
        </div>
        <p className="text-xs text-slate-500">Sign in with an authorized Super Admin account</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartelectronics.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Authenticating…' : 'Access Admin Console'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Protected by 256-bit JWT Role Authorization Guard</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading admin portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
