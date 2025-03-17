import React from 'react'
import { TripSuggestion } from './trip-suggester'
import Image from 'next/image'
import TrainStation from '@/app/api/models/train-station'
import { intervalToDuration } from 'date-fns'
import { AvailableJourney } from '../book/journeys'
import { Skeleton } from '../ui/skeleton'
import Link from 'next/link'

const retrieveQuickerRoute = (journeys: AvailableJourney[][]) => {
  const quicker = journeys
    .map(
      (route) =>
        route[route.length - 1].heure_arrivee.getTime() -
        route[0].heure_depart.getTime()
    )
    .sort()[0]
  const duration = intervalToDuration({ start: 0, end: quicker * 1000 })
  if (!duration.hours) return `${duration.minutes}min`
  return `${duration.hours}h${(duration.minutes ?? 0)
    .toString()
    .padStart(2, '0')}`
}

export default function TripSuggestionComponent({
  suggestion,
  trainStations,
}: {
  suggestion: TripSuggestion
  trainStations: TrainStation[]
}) {
  const [loadingError, setLoadingError] = React.useState(false)
  const quickerRouteTimeAtInbound = React.useMemo(
    () => retrieveQuickerRoute(suggestion.route_from),
    [suggestion.route_from]
  )

  const quickerRouteTimeAtOutbound = React.useMemo(
    () => retrieveQuickerRoute(suggestion.route_to),
    [suggestion.route_to]
  )

  return (
    <Link href={`/trips/suggestion/${suggestion._id}`}>
      <div className="bg-white p-1 w-[220px] shrink-0 rounded-lg overflow-hidden">
        <div className="h-[160px] w-[calc(220px-.5rem)] rounded-t-sm overflow-hidden relative">
          {!loadingError ? (
            <Image
              src={`/city/${suggestion.to.toLowerCase()}.jpg`}
              alt={suggestion.to}
              layout={'fill'}
              className="object-cover"
              onError={() => setLoadingError(true)}
            />
          ) : (
            <Skeleton className="w-[220px] h-[160px]" />
          )}
        </div>
        <div className="px-4 mt-5">
          <div className="h-[90px]">
            <h2 className="text-md font-bold capitalize">
              {trainStations
                ?.find((d) => d.iata === suggestion.to)
                ?.name.toLowerCase() || suggestion.to.toLowerCase()}
            </h2>
            <p className="text-sm text-muted-foreground">
              Au départ de{' '}
              <span className="capitalize">
                {trainStations
                  ?.find((d) => d.iata === suggestion.from)
                  ?.name.toLowerCase() || suggestion.from.toLowerCase()}
              </span>
              <br />
              {quickerRouteTimeAtInbound}
              {quickerRouteTimeAtOutbound}
            </p>
          </div>
          <div className="mb-2">
            <p className="text-sm text-muted-foreground mb-1">
              Accèssible pour
            </p>
            <div className="rounded-lg bg-[#F1C83C] size-fit px-3 py-2 font-bold flex flex-row gap-1">
              <p>0 €</p>
              <p className="text-[10px] font-medium">(1)</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
