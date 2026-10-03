'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    function checkAuth() {
      if (typeof window === 'undefined') return;

      const token =
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token') ||
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('adminToken=') || row.startsWith('token='))
          ?.split('=')[1];

      let user = null;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          user = JSON.parse(storedUser);
        }
      } catch {
        user = null;
      }

      const isValidAdmin = Boolean(token && user && user.role === 'admin');

      if (pathname === '/login') {
        if (isValidAdmin) {
          router.replace('/dashboard');
        } else {
          setIsAuthenticated(false);
        }
      } else {
        if (!isValidAdmin) {
          setIsAuthenticated(false);
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        } else {
          setIsAuthenticated(true);
        }
      }
    }

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [pathname, router]);

  // If on login page, allow rendering
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If verifying or unauthenticated, show protected loader
  if (isAuthenticated !== true) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-2xl shadow-xl shadow-blue-500/25 animate-pulse">
            <Zap className="w-7 h-7 text-cyan-200 fill-current" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-sm font-black text-white tracking-wider uppercase">
              Smart<span className="text-cyan-400">Electronics</span> Admin
            </h2>
            <p className="text-xs text-slate-400 font-medium">Verifying security credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
