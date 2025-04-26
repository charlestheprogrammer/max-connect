import type { Metadata } from 'next'
import './globals.css'
import { SearchProvider } from '@/context/search'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'MAX Connect : Rentabilisez votre abonnement SNCF TGV MAX !',
  description:
    'Anticipez vos voyages SNCF avec votre abonnement MAX en planifiant votre itinéraire et vos correspondances sur MAX Connect !',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-[#F3F3F8]`}>
        <SessionProvider>
          <SearchProvider>{children}</SearchProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
