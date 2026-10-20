import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitTracker — Guided by Olivier',
  description: 'Ton carnet d’entraînement personnalisé, conçu avec Olivier.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#101211',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased">
        {children}
        {/* Statistiques Vercel : uniquement quand le site est construit sur Vercel */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
