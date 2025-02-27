import { MoveLeft, MoveRight } from 'lucide-react'
import { SearchBar } from '@/components/search-bar'
import { createClient } from '@/utils/server/supabase'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import CurrentOffer from '@/components/home/current-offer'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.from('train-station').select()

  if (!data) {
    return <div>loading...</div>
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-nunito-sans)] bg-[#F3F3F8]">
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
        <div className="flex justify-between flex-row items-center">
          <div className="flex flex-col gap-4">
            <span className="bg-[#F1C83C] text-[#0C131F] text-sm font-medium size-fit px-3 py-1 rounded-full">
              Dernière minute
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold max-w-[600px]">
              Les meilleures offres du moment vous attendent pour 0€
            </h1>
            <p>Exploitez au maximum votre abonnement.</p>
          </div>
          <Button className="hidden sm:block px-12 py-2 h-12 rounded-full font-bold">Je fonce</Button>
        </div>
        <div className="py-14">
          <div className="overflow-x-auto w-full flex flex-row gap-4">
            <CurrentOffer
              imageSrc="/toulouse.png"
              alt="train"
              from="Paris"
              to="Toulouse"
              price={0}
            />
            <CurrentOffer
              imageSrc="/toulouse.png"
              alt="train"
              from="Paris"
              to="Lyon"
              price={0}
            />
            <CurrentOffer
              imageSrc="/toulouse.png"
              alt="train"
              from="Paris"
              to="Marseille"
              price={0}
            />
            <CurrentOffer
              imageSrc="/toulouse.png"
              alt="train"
              from="Paris"
              to="Bordeaux"
              price={0}
            />
            <CurrentOffer
              imageSrc="/toulouse.png"
              alt="train"
              from="Paris"
              to="Bordeaux"
              price={0}
            />
            <CurrentOffer
              imageSrc="/toulouse.png"
              alt="train"
              from="Paris"
              to="Bordeaux"
              price={0}
            />
            <CurrentOffer
              imageSrc="/toulouse.png"
              alt="train"
              from="Paris"
              to="Bordeaux"
              price={0}
            />
            <CurrentOffer
              imageSrc="/toulouse.png"
              alt="train"
              from="Paris"
              to="Bordeaux"
              price={0}
            />
          </div>
          <div className="flex flex-row justify-end mt-14 gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 border border-[#0C131F] rounded-full"
            >
              <MoveLeft color="#0C131F" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 border border-[#0C131F] rounded-full"
            >
              <MoveRight color="#0C131F" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
