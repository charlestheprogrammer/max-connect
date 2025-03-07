'use client'

import React from 'react'
import CurrentOffer from './current-offer'
import { Button } from '../ui/button'
import { MoveLeft, MoveRight } from 'lucide-react'
import TrainStation from '@/app/api/models/train-station'

type HighlightTrip = {
  origine: string
  destination: string
  trips: string[][]
  destination_iata: string
  origine_iata: string
  _id: string
}

export default function Trips({
  trainStations,
}: {
  trainStations: TrainStation[]
}) {
  const [trips, setTrips] = React.useState<HighlightTrip[]>([])

  React.useEffect(() => {
    fetch('/api/trips')
      .then((res) => res.json())
      .then((data) => {
        setTrips(data)
      })
  }, [])

  const swiperRef = React.useRef<HTMLDivElement>(null)

  return (
    <div className="py-14">
      <div
        className="overflow-x-auto w-full flex flex-row gap-4 no-scrollbar"
        ref={swiperRef}
      >
        {trips.map((trip, index) => (
          <CurrentOffer
            key={index}
            from={
              trainStations.find(
                (station) => station.iata === trip.origine_iata
              )?.name ?? ''
            }
            to={
              trainStations.find(
                (station) => station.iata === trip.destination_iata
              )?.name ?? ''
            }
            price={0}
            imageSrc={`/city/${trip.destination_iata.toLowerCase()}.jpg`}
            alt={trip.destination}
            _id={trip._id}
          />
        ))}
      </div>
      <div className="flex flex-row justify-end mt-14 gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-12 w-12 border border-[#0C131F] rounded-full"
          onClick={() => {
            swiperRef.current?.scrollBy({
              left: -240,
              behavior: 'smooth',
            })
          }}
        >
          <MoveLeft color="#0C131F" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-12 w-12 border border-[#0C131F] rounded-full"
          onClick={() => {
            swiperRef.current?.scrollBy({
              left: 240,
              behavior: 'smooth',
            })
          }}
        >
          <MoveRight color="#0C131F" />
        </Button>
      </div>
    </div>
  )
}
