import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailsClient from './ProductDetailsClient';
import { ProductService } from '@/services/productService';

interface ProductPageProps {
  params: Promise<{ id: string }> | { id: string };
}

async function getProductData(idParam: string) {
  try {
    const numId = Number(idParam);
    if (!isNaN(numId)) {
      const prod = await ProductService.getProductById(numId);
      if (prod) return prod;
    }
    // Fallback search in all products
    const res = await ProductService.getProducts({ limit: 150 });
    const match = res?.products?.find((p: any) => String(p.id) === idParam || String(p._id) === idParam);
    return match || null;
  } catch (err) {
    console.warn('[SEO getProductData] Failed to load product:', err);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductData(resolvedParams.id);

  if (!product) {
    return {
      title: 'Product Not Found | SmartElectronics',
      description: 'The requested electronics product could not be found on SmartElectronics.',
    };
  }

  const title = `${product.title} — Buy Online at Best Price in India`;
  const description =
    product.description ||
    `Buy ${product.title} (${product.brand || 'Authentic Direct'}) online at SmartElectronics. Special price ₹${Number(product.price).toLocaleString('en-IN')}, express delivery, and 100% genuine brand warranty.`;
  const imageUrl = product.thumbnail || product.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80';

  return {
    title,
    description,
    keywords: [
      product.title,
      product.category,
      product.subCategory,
      product.brand || 'Tech Brand',
      product.sku,
      'Buy Electronics Online',
      'Best Tech Deals India',
      'SmartElectronics',
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${product.title} | SmartElectronics`,
      description,
      url: `https://smartelectronics.com/products/${resolvedParams.id}`,
      siteName: 'SmartElectronics',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | SmartElectronics`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://smartelectronics.com/products/${resolvedParams.id}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductData(resolvedParams.id);

  // Schema.org Product Structured Data (JSON-LD)
  const productJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: [product.thumbnail, ...(product.images || [])].filter(Boolean),
        description: product.description || product.title,
        sku: product.sku || `SE-${product.id || resolvedParams.id}`,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'SmartElectronics',
        },
        offers: {
          '@type': 'Offer',
          url: `https://smartelectronic.com/products/${resolvedParams.id}`,
          priceCurrency: 'INR',
          price: Number(product.price) || 0,
          availability:
            (typeof product.stock === 'number' ? product.stock > 0 : false)
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'SmartElectronics Retail Ltd',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating ?? 4.8,
          reviewCount: 215,
        },
      }
    : null;

  // Schema.org BreadcrumbList Structured Data (JSON-LD)
  const breadcrumbJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://smartelectronics.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: product.category || 'Products',
            item: product.category
              ? `https://smartelectronics.com/products?category=${encodeURIComponent(product.category)}`
              : 'https://smartelectronics.com/products',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.title,
            item: `https://smartelectronics.com/products/${resolvedParams.id}`,
          },
        ],
      }
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ProductDetailsClient initialProduct={product} />
    </>
  );
}
