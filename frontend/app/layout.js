import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
