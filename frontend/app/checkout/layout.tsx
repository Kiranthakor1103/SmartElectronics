import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout & Payment',
  description:
    'Complete your order with 100% secure payment gateway powered by Stripe Card, UPI, and Cash on Delivery.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
