import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Diagram Tools',
  description: 'Teaching tools for creating clean, exportable diagrams.',
  openGraph: {
    images: [{ url: '/og-image.jpg', width: 1280, height: 1024 }],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon-iphone-60x60.png', sizes: '60x60' },
      { url: '/apple-touch-icon-iphone-retina-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-ipad-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-ipad-retina-152x152.png', sizes: '152x152' },
    ],
  },
  other: {
    msapplication-TileImage: '/mstile-150x150.png',
    msapplication-TileColor: '#ffffff',
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {GA_ID && GA_ID !== 'G-XXXXXXXXXX' && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments);}
              gtag('js',new Date());
              gtag('config','${GA_ID}');
            `}} />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
