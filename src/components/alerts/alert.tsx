'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatTripDate } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'
import TrainStation from '@/app/api/models/train-station'
import { Skeleton } from '../ui/skeleton'

export default function Alert({
  alert,
  trainStations,
}: {
  alert: {
    id: number
    destination: string
    origine: string
    date: Date
  }
  trainStations: TrainStation[]
}) {
  const [error, setError] = React.useState(false)
  return (
    <Link
      href={`/book?from=${alert.origine}&to=${
        alert.destination
      }&fromDate=${format(alert.date, 'yyyy-MM-d')}`}
      key={alert.id}
    >
      <div className="bg-white p-1 shrink-0 rounded-lg overflow-hidden">
        <div className="h-[160px] rounded-t-sm overflow-hidden relative">
          {!error ? (
            <Image
              src={`/city/${alert.destination.toLowerCase()}.jpg`}
              alt={alert.destination}
              layout={'fill'}
              className="object-cover"
              onError={() => setError(true)}
            />
          ) : (
            <Skeleton className="w-full h-[160px]" />
          )}
        </div>
        <div className="px-4 mt-5">
          <div className="h-[90px]">
            <h2 className="text-md font-bold">
              {trainStations.find((v) => v.iata === alert.destination)?.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Au départ de{' '}
              {trainStations.find((v) => v.iata === alert.origine)?.name}
            </p>
          </div>
          <div className="mb-2">
            <div className="rounded-lg bg-[#F1C83C] size-fit px-3 py-2 font-medium flex flex-row items-center gap-1 text-sm">
              <Calendar size={13} className="inline-block" />
              <p>{formatTripDate(alert.date, false)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
