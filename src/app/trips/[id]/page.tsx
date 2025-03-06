import HighlightTrip from '@/app/api/models/highlight-hourney'
import JourneyModel from '@/app/api/models/journey'
import Journey from '@/components/book/journey'
import { AvailableJourney } from '@/components/book/journeys'
import { connect } from '@/utils/server/mongoose'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  await connect()
  let data: HighlightTrip | null = await HighlightTrip.findById(params.id)

  if (!data) {
    return <div>Not found</div>
  }

  const populatedTrips = await Promise.all(
    data.trips.map(async (tripArray) => {
      return Promise.all(
        tripArray.map(async (journeyId) => {
          const journey = await JourneyModel.findById(journeyId)
          return journey
        })
      )
    })
  )

  data = {
    ...data.toObject!(),
    trips: populatedTrips as AvailableJourney[][],
  } as HighlightTrip

  return (
    <div className="flex flex-col gap-2">
      {data.trips.map((tripArray, index) => (
        <Journey key={index} journey={tripArray as AvailableJourney[]} />
      ))}
    </div>
  )
}
