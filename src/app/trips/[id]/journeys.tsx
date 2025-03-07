import React from 'react'
import HighlightTrip from '@/app/api/models/highlight-hourney'
import JourneyModel from '@/app/api/models/journey'
import Journey from '@/components/book/journey'
import { AvailableJourney } from '@/components/book/journeys'

export default async function Journeys({
  data,
  way,
}: {
  data: HighlightTrip | null
  way: 'to' | 'from'
}) {
  if (!data) {
    return <div>Not found</div>
  }

  const journeys = way === 'to' ? data.results_to : data.results_from
  const populatedTrips = []

  populatedTrips.push(
    ...(await Promise.all(
      journeys.map(async (tripArray) => {
        return Promise.all(
          tripArray.map(async (journeyId) => {
            const journey = await JourneyModel.findById(journeyId)
            return journey
          })
        )
      })
    )) as AvailableJourney[][]
  )

  return (
    <div className="flex flex-col gap-2 flex-1">
      {populatedTrips.map((tripArray, index) => (
        <Journey key={index} journey={tripArray as AvailableJourney[]} />
      ))}
    </div>
  )
}
