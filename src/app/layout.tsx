import type { Metadata } from 'next'
// import { Nunito_Sans } from 'next/font/google'
import './globals.css'
import { SearchProvider } from '@/context/search'

// const nunitoSans = Nunito_Sans({
//   variable: '--font-nunito-sans',
//   subsets: ['latin'],
// })

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
        <SearchProvider>{children}</SearchProvider>
      </body>
    </html>
  )
}
