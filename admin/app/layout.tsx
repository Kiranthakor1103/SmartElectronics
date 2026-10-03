import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from './components/ToastProvider';
import { SidebarProvider } from './components/SidebarContext';
import AdminAuthGuard from './components/AdminAuthGuard';

export const metadata: Metadata = {
  title: 'SmartElectronics Admin — Store Management Console',
  description: 'Manage electronics catalog, technical specifications, customer accounts, and order fulfillment.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#f8fafc] text-slate-900 min-h-screen antialiased selection:bg-indigo-100 selection:text-indigo-900"
      >
        <ToastProvider>
          <SidebarProvider>
            <AdminAuthGuard>{children}</AdminAuthGuard>
          </SidebarProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
