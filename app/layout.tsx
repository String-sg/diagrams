import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Diagram Tools',
  description: 'Teaching tools for creating clean, exportable diagrams.',
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
