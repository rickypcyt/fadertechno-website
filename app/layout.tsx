import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import QueryProvider from './components/QueryProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

const switzer = localFont({
  src: [
    { path: './fonts/switzer/Switzer-Extralight.woff', weight: '200', style: 'normal' },
    { path: './fonts/switzer/Switzer-ExtralightItalic.woff', weight: '200', style: 'italic' },
    { path: './fonts/switzer/Switzer-Light.woff', weight: '300', style: 'normal' },
    { path: './fonts/switzer/Switzer-LightItalic.woff', weight: '300', style: 'italic' },
    { path: './fonts/switzer/Switzer-Regular.woff', weight: '400', style: 'normal' },
    { path: './fonts/switzer/Switzer-Italic.woff', weight: '400', style: 'italic' },
    { path: './fonts/switzer/Switzer-Medium.woff', weight: '500', style: 'normal' },
    { path: './fonts/switzer/Switzer-MediumItalic.woff', weight: '500', style: 'italic' },
    { path: './fonts/switzer/Switzer-Semibold.woff', weight: '600', style: 'normal' },
    { path: './fonts/switzer/Switzer-SemiboldItalic.woff', weight: '600', style: 'italic' },
    { path: './fonts/switzer/Switzer-Bold.woff', weight: '700', style: 'normal' },
    { path: './fonts/switzer/Switzer-BoldItalic.woff', weight: '700', style: 'italic' },
    { path: './fonts/switzer/Switzer-Extrabold.woff', weight: '800', style: 'normal' },
    { path: './fonts/switzer/Switzer-ExtraboldItalic.woff', weight: '800', style: 'italic' },
    { path: './fonts/switzer/Switzer-Black.woff', weight: '900', style: 'normal' },
    { path: './fonts/switzer/Switzer-BlackItalic.woff', weight: '900', style: 'italic' },
  ],
  variable: '--font-switzer',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FADER',
  description: 'FADER — Electrónica atemporal en Alicante',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${switzer.variable}`}>
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
