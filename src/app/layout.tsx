import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { HashErrorListener } from '@/components/HashErrorListener'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hospital Nuestra Señora del Carmen',
  description: 'Sistema Administrativo Interno',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body 
        className={`${inter.className} bg-sys-bg text-sys-text antialiased`}
        suppressHydrationWarning
      >
        <HashErrorListener />
        {children}
      </body>
    </html>
  )
}
