import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders & Real-Time Delivery Tracking | SmartElectronics',
  description:
    'Track your order shipments in real-time, view order fulfillment history, download tax invoices, and manage returns on SmartElectronics.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
