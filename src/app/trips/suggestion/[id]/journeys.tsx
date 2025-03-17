import React from 'react'
import Journey from '@/components/book/journey'
import { AvailableJourney } from '@/components/book/journeys'
import TrainStation from '@/app/api/models/train-station'
import { TripSuggestion } from '@/components/home/trip-suggester'

export default async function Journeys({
  data,
  way,
  trainStations,
}: {
  data: TripSuggestion | null
  way: 'to' | 'from'
  trainStations: TrainStation[]
}) {
  if (!data) {
    return <div>Not found</div>
  }

  const journeys = way === 'to' ? data.route_to : data.route_from

  return (
    <div className="flex flex-col gap-2 flex-1">
      {journeys.map(
        (tripArray, index) =>
          tripArray[0] != null && (
            <Journey
              key={index}
              journey={tripArray as AvailableJourney[]}
              data={trainStations}
            />
          )
      )}
    </div>
  )
}
