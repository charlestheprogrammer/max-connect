import HighlightTrip from '@/app/api/models/highlight-hourney'
import { connect } from '@/utils/server/mongoose'
import Journeys from './journeys'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createClient } from '@/utils/server/supabase'
import { cn, formatTripDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SwitchWay from '@/components/trips/switch-way'

export default async function Page(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ way: 'to' | 'from' }> | undefined
}) {
  const params = await props.params
  const searchParams = await props.searchParams

  await connect()
  const trip: HighlightTrip | null = await HighlightTrip.findById(params.id)

  const supabase = await createClient()
  const { data } = await supabase.from('train-station').select()

  if (!trip || !data) {
    return <div>Not found</div>
  }

  return (
    <div className="px-4 pt-4">
      <div
        className={cn(
          'w-full flex justify-center rounded-lg h-[220px] md:h-[320px] bg-cover bg-center overflow-hidden bg-[#14708a]'
        )}
        style={{
          backgroundImage: `url('/city/${trip.destination_iata.toLowerCase()}.jpg')`,
        }}
      >
        <div className="w-full h-full backdrop-blur-sm flex items-center justify-center flex-col bg-[#00000030] gap-2 relative p-4">
          <h1 className="text-white text-2xl md:text-[45px] font-bold text-center">
            Destination{' '}
            {
              data.find((station) => station.iata === trip?.destination_iata)
                ?.name
            }
          </h1>
          <h3 className="text-gray-100 font-medium text-sm md:text-lg text-center">
            {formatTripDate(trip.from, false)} au{' '}
            {formatTripDate(trip.to, false)} • {trip.results_from.length}{' '}
            options au départ • {trip.results_to.length} options au retour
          </h3>
          <Link href="/">
            <div className="w-9 h-9 bg-white absolute top-2 left-2 rounded-lg flex items-center justify-center">
              <ArrowLeft size={18} />
            </div>
          </Link>
        </div>
      </div>
      <div className="flex gap-4 my-10 lg:flex-row flex-col">
        <div className="lg:w-[280px] bg-white lg:h-fit rounded-lg sticky lg:top-4 top-0 p-4 w-full">
          <SwitchWay />
          <div className="mt-4 md:block hidden">
            <h3 className="font-medium mb-2">Statistiques</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Direct</span>
                <span>
                  {
                    trip[
                      searchParams?.way === 'to' ? 'results_to' : 'results_from'
                    ].filter((j) => j.length === 1).length
                  }{' '}
                  trajets
                </span>
              </div>
              <div className="flex justify-between">
                <span>1 correspondance</span>
                <span>
                  {
                    trip[
                      searchParams?.way === 'to' ? 'results_to' : 'results_from'
                    ].filter((j) => j.length === 2).length
                  }{' '}
                  trajets
                </span>
              </div>
              <div className="flex justify-between">
                <span>2 correspondances</span>
                <span>
                  {
                    trip[
                      searchParams?.way === 'to' ? 'results_to' : 'results_from'
                    ].filter((j) => j.length === 3).length
                  }{' '}
                  trajets
                </span>
              </div>
              <div className="flex justify-between">
                <span>3 correspondances</span>
                <span>
                  {
                    trip[
                      searchParams?.way === 'to' ? 'results_to' : 'results_from'
                    ].filter((j) => j.length === 4).length
                  }{' '}
                  trajets
                </span>
              </div>
            </div>
          </div>
        </div>
        <Suspense
          fallback={
            <p className="flex justify-center flex-1">
              <LoadingSpinner size={100} color="#14708a" />
            </p>
          }
        >
          <Journeys data={trip} way={searchParams?.way ?? 'from'} />
        </Suspense>{' '}
      </div>
    </div>
  )
}
