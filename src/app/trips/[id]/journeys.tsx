import React from 'react'
import HighlightTrip from '@/app/api/models/highlight-trip'
import JourneyModel from '@/app/api/models/journey'
import Journey from '@/components/book/journey'
import { AvailableJourney } from '@/components/book/journeys'
import TrainStation from '@/app/api/models/train-station'

export default async function Journeys({
  data,
  way,
  trainStations,
}: {
  data: HighlightTrip | null
  way: 'to' | 'from'
  trainStations: TrainStation[]
}) {
  if (!data) {
    return <div>Not found</div>
  }

  const journeys = way === 'to' ? data.results_to : data.results_from
  const populatedTrips = []

  populatedTrips.push(
    ...((await Promise.all(
      journeys.map(async (tripArray) => {
        return Promise.all(
          tripArray.map(async (journeyId) => {
            const journey = await JourneyModel.findById(journeyId)
            return {
              train_no: journey?.train_no,
              origine: journey?.origine,
              destination: journey?.destination,
              destination_iata: journey?.destination_iata,
              origine_iata: journey?.origine_iata,
              date: journey?.date,
              heure_depart: journey?.heure_depart,
              heure_arrivee: journey?.heure_arrivee,
            }
          })
        )
      })
    )) as AvailableJourney[][])
  )

  return (
    <div className="flex flex-col gap-2 flex-1">
      {populatedTrips.map(
        (tripArray, index) =>
          tripArray[0] != null && (
            <Journey key={index} journey={tripArray} data={trainStations} />
          )
      )}
    </div>
  )
}
