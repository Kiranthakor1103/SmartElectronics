import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Shopping Cart — Review Items & Apply Promo Codes | SmartElectronics',
  description:
    'Review your selected items, apply exclusive discount promo codes, calculate free express shipping, and proceed to secure checkout on SmartElectronics.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
