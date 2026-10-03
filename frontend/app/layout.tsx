import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ReduxProvider } from "./providers";
import { inter } from "./lib/fonts";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://smartelectronics.com"),

  title: {
    default: "SmartElectronics — India's Premier Online Electronics & Tech Superstore",
    template: "%s | SmartElectronics",
  },
  description:
    "Shop authentic smartphones, laptops, 4K OLED TVs, premium audio, smart home devices, and appliances on SmartElectronics. 100% genuine brand warranty, express delivery, and unbeatable deals.",

  keywords: [
    "SmartElectronics",
    "Electronics Online Store",
    "Best Smartphone Deals India",
    "Laptops & Gaming Computers",
    "4K OLED Smart TVs",
    "Audio Devices & Soundbars",
    "Smart Watches & Wearables",
    "Home & Kitchen Appliances",
    "Computer Accessories & SSD",
    "Brand Warranty Electronics",
    "Fast Tech Delivery India",
  ],

  authors: [{ name: "SmartElectronics", url: "https://smartelectronics.com" }],
  creator: "SmartElectronics",
  publisher: "SmartElectronics Retail Ltd",

  alternates: {
    canonical: "https://smartelectronics.com",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    title: "SmartElectronics — India's Premier Online Electronics & Tech Superstore",
    description:
      "Shop 100% genuine electronics, flagship smartphones, laptops, 4K TVs, and home appliances with brand warranty and express delivery.",
    url: "https://smartelectronics.com",
    siteName: "SmartElectronics",
    images: [
      {
        url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "SmartElectronics Tech Superstore",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SmartElectronics — India's Premier Online Electronics & Tech Superstore",
    description:
      "Shop authentic electronics, smartphones, laptops, 4K TVs, and home appliances with fast delivery and brand warranty.",
    images: ["https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80"],
    creator: "@smartelectronics",
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://smartelectronics.com/#organization",
      name: "SmartElectronics",
      url: "https://smartelectronics.com",
      logo: "https://smartelectronics.com/logo.png",
      sameAs: [
        "https://twitter.com/smartelectronics",
        "https://facebook.com/smartelectronics",
        "https://instagram.com/smartelectronics",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+91-1800-889-7627",
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://smartelectronics.com/#website",
      url: "https://smartelectronics.com",
      name: "SmartElectronics",
      description: "India's Premier Online Electronics & Tech Superstore",
      publisher: {
        "@id": "https://smartelectronics.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://smartelectronics.com/products?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ReduxProvider>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Suspense fallback={<div className="h-16 w-full bg-slate-900 animate-pulse" />}>
              <Navbar />
            </Suspense>
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
