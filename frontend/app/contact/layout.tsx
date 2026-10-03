import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us & 24/7 Tech Help Desk | SmartElectronics',
  description:
    'Need help with an order, delivery tracking, or hardware warranty? Contact SmartElectronics customer care via email, phone, or live ticket support.',
  keywords: [
    'Contact SmartElectronics',
    'Customer Care',
    'Tech Help Desk',
    'Support Email',
    'Electronics Warranty Support',
  ],
  openGraph: {
    title: 'Customer Support & Tech Help Desk | SmartElectronics',
    description: 'Get in touch with SmartElectronics customer assistance 24/7.',
    url: 'https://smartelectronics.com/contact',
  },
  alternates: {
    canonical: 'https://smartelectronics.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
