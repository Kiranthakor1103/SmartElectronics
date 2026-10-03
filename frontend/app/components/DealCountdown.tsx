'use client';

import { useEffect, useState } from 'react';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function DealCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = Math.max(0, end - now);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold text-slate-500 mr-1">Ends in</span>
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
        <span key={i} className="flex flex-col items-center">
          <span className="min-w-[32px] rounded-md bg-slate-800 px-2 py-0.5 text-center text-sm font-bold tabular-nums text-white">
            {pad(val)}
          </span>
          {i < 2 && <span className="mx-0.5 text-base font-bold text-slate-600 leading-none mt-[-2px]">:</span>}
        </span>
      ))}
    </div>
  );
}
