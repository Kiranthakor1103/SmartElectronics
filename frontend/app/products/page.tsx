import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductsPageContent from './ProductsPageContent';
import { Spinner } from '@/app/components/ui/Spinner';
import { PageHero } from '@/app/components/ui/PageHero';

export const metadata: Metadata = {
  title: 'All Electronics & Gadgets Catalog — Shop Smartphones, Laptops, 4K TVs & Audio',
  description:
    'Explore 55 flagship electronic products across 11 departments on SmartElectronics. Genuine brand warranties, express dispatch, smartphones, laptops, smart TVs, soundbars, and smart devices.',
  keywords: [
    'SmartElectronics',
    'Electronics Catalog India',
    'Smartphones & Mobile Accessories',
    'Laptops & Gaming Computers',
    '4K OLED Smart TVs',
    'Audio Devices & Soundbars',
    'Smart Watches & Home Devices',
    'Computer Hardware & SSD',
    'Home & Kitchen Appliances',
    'Cameras & Security',
  ],
  openGraph: {
    title: 'Explore All Electronics Products | SmartElectronics',
    description:
      'Shop authentic electronics, smartphones, laptops, and home appliances with fast delivery and SmartElectronics 100% genuine brand warranty.',
    url: 'https://smartelectronics.com/products',
  },
  alternates: {
    canonical: 'https://smartelectronics.com/products',
  },
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHero eyebrow="Shop" title="Curated premium products" />
          <div className="section-container py-20">
            <Spinner label="Loading products…" />
          </div>
        </>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
