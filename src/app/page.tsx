import { SearchBar } from '@/components/search-bar'
import { createClient } from '@/utils/server/supabase'
import Image from 'next/image'
import React from 'react'
import Trips from '@/components/home/trips'
import TripSuggester from '@/components/home/trip-suggester'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Toaster } from '@/components/ui/sonner'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.from('train-station').select()

  if (!data) {
    return (
      <p className="flex justify-center flex-1 h-screen items-center">
        <LoadingSpinner size={100} color="#14708a" />
      </p>
    )
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-nunito-sans)] bg-[#F3F3F8]">
      <Toaster />
      <main className="flex flex-col items-center justify-end bg-[#0C131F] h-[240px] relative">
        <Image
          src="/sncf-connect.svg"
          alt="SNCF Connect logo"
          className="absolute top-4 left-4"
          width={130}
          height={64}
          priority
        />
        <SearchBar trainStations={data} className="translate-y-1/2" />
      </main>
      <div className="w-11/12 max-w-[1000px] mx-auto p-4 mt-[200px] md:mt-[150px]">
        <div className="flex justify-between flex-col gap-4 sm:gap-0 sm:flex-row items-center">
          <div className="flex flex-col gap-4">
            <span className="bg-[#F1C83C] text-[#0C131F] text-sm font-medium size-fit px-3 py-1 rounded-full">
              Dernière minute
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold max-w-[600px]">
              Les meilleures offres du moment vous attendent pour 0€
            </h1>
            <p>Exploitez au maximum votre abonnement.</p>
          </div>
          <TripSuggester trainStations={data} />
        </div>
        <Trips trainStations={data} />
      </div>
    </div>
  )
}
