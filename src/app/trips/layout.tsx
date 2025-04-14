import type { Metadata } from 'next'
import '../globals.css'

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
  return <>{children}</>
}
