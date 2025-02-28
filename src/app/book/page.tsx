import Journeys from '@/components/book/journeys'
import SearchState from '@/components/book/search-state'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function Home() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-nunito-sans)] bg-[#F3F3F8]">
      <main className="flex flex-col items-center justify-end bg-[#0C131F] h-[210px] p-4 sticky top-0 z-10">
        <Link href={'/'}>
          <Image
            src="/sncf-connect.svg"
            alt="SNCF Connect logo"
            className="absolute top-4 left-4"
            width={130}
            height={64}
            priority
          />
        </Link>
        <Suspense fallback={<div>loading...</div>}>
          <SearchState />
        </Suspense>
      </main>
      <div className="w-11/12 max-w-[1000px] mx-auto p-4 mt-4">
        <Suspense fallback={<div>loading...</div>}>
          <Journeys />
        </Suspense>
      </div>
    </div>
  )
}
