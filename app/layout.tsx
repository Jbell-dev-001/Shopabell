import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShopAbell - WhatsApp First E-commerce Platform',
  description: 'Create your online store through WhatsApp. Sell products using AI-powered livestream, manage orders, and grow your business.',
  keywords: 'WhatsApp ecommerce, online store, AI livestream, sell products, business growth',
  authors: [{ name: 'ShopAbell Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#25D366',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ]
  },
  openGraph: {
    title: 'ShopAbell - WhatsApp First E-commerce Platform',
    description: 'Create your online store through WhatsApp. Sell products using AI-powered livestream, manage orders, and grow your business.',
    url: 'https://shopabell.com',
    siteName: 'ShopAbell',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'ShopAbell Logo'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopAbell - WhatsApp First E-commerce Platform',
    description: 'Create your online store through WhatsApp. Sell products using AI-powered livestream, manage orders, and grow your business.',
    images: ['/icons/icon-512x512.png']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ShopAbell" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#25D366" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="root">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  )
}