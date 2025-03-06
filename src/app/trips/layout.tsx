import type { Metadata } from 'next'
import { Nunito_Sans } from 'next/font/google'
import '../globals.css'

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MAX Connect : Rentabilisez votre abonnement MAX Jeune !',
  description:
    'Réservez vos Billets de Train avec votre abonnement MAX Jeune et planifiez votre itinéraire sur MAX Connect !',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} antialiased bg-[#F3F3F8]`}>
        {children}
      </body>
    </html>
  )
}
