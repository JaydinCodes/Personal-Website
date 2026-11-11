import { Inter, JetBrains_Mono, Syne } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-syne',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata = {
  title: 'Jaydin Morrison | Software Engineer',
  description:
    'Software Engineer crafting polished digital products, distributed systems, and AI-powered experiences.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
