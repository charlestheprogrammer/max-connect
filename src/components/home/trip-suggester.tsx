'use client'

import React, { useState } from 'react'
import { addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DatePickerWithRange } from '../date-range-picker'
import { DateRange } from 'react-day-picker'
import SearchBarButton from '../search/search-bar-button'
import TrainStation from '@/app/api/models/train-station'
import { AvailableJourney } from '../book/journeys'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import TripSuggestionComponent from './trip-suggestion'
import { Skeleton } from '../ui/skeleton'

export type TripSuggestion = {
  canGo: boolean
  route_from: AvailableJourney[][]
  route_to: AvailableJourney[][]
  from: string
  to: string
  _id: string
}

export default function TripSuggester({
  trainStations,
}: {
  trainStations: TrainStation[]
}) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 2),
  })
  const [from, setFrom] = useState('')
  const [fromStation, setFromStation] = useState<TrainStation | null>(null)
  const [suggestions, setSuggestions] = useState<TripSuggestion[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customRequest, setCustomRequest] = useState('')
  const [noResults, setNoResults] = useState(false)

  const handleGetSuggestions = async () => {
    setIsLoading(true)
    setSuggestions(null)
    setNoResults(false)
    fetch('/api/trips/imagine', {
      method: 'POST',
      body: JSON.stringify({
        from: fromStation?.iata,
        from_date: date?.from?.toISOString(),
        to_date: date?.to?.toISOString(),
        custom_request: customRequest,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if ((data as TripSuggestion[]).length === 0) {
          toast(
            `Aucun voyage n'a été trouvé au départ de ${fromStation?.name} pour vos dates.`
          )
          setIsLoading(false)
          setNoResults(true)
          return
        }
        setSuggestions(
          (data as TripSuggestion[]).map((suggestion) => ({
            ...suggestion,
            route_from: suggestion.route_from.map((journeys) =>
              journeys.map((journey) => ({
                ...journey,
                heure_arrivee: new Date(journey.heure_arrivee),
                heure_depart: new Date(journey.heure_depart),
                date: new Date(journey.heure_depart),
              }))
            ),
            route_to: suggestion.route_to.map((journeys) =>
              journeys.map((journey) => ({
                ...journey,
                heure_arrivee: new Date(journey.heure_arrivee),
                heure_depart: new Date(journey.heure_depart),
                date: new Date(journey.heure_depart),
              }))
            ),
          }))
        )
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast('Event has been created.')
      })
  }

  React.useEffect(() => {
    setNoResults(false)
  }, [date, fromStation])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex px-12 py-2 h-12 rounded-full font-bold items-center gap-2 flex-row">
          <Sparkles /> Imagine
        </Button>
      </DialogTrigger>
      <DialogContent
        className={
          'w-11/12 max-w-[700px] overflow-y-scroll max-h-screen bg-[#F3F3F8]'
        }
      >
        <DialogTitle className="flex">
          <span className="text-[#14708a]"> l&apos;IA</span>
          <Sparkles color="#14708a" size={12} className="mr-2" /> pour planifier
          votre week end
        </DialogTitle>
        <div className="grid grid-cols-1 bg-white rounded-lg p-2">
          {/* Departure Date Selector */}
          <SearchBarButton
            value={from}
            setValue={setFrom}
            setTrainStation={setFromStation}
            type="Départ"
            id="from-modal"
            trainStations={trainStations}
          />
          <DatePickerWithRange
            onChangeDate={(date) => {
              setDate(date)
            }}
          />
          <Textarea
            placeholder="Ajouter une demande spéciale ici."
            id="message"
            className="border-none shadow-none hover:bg-accent"
            onChange={(ev) => setCustomRequest(ev.target.value)}
            value={customRequest}
          />
        </div>
        {isLoading && (
          <div className="mt-1 w-full flex gap-4 overflow-auto no-scrollbar">
            <Skeleton className="w-[220px] h-[340px] shrink-0" />
            <Skeleton className="w-[220px] h-[340px] shrink-0" />
            <Skeleton className="w-[220px] h-[340px] shrink-0" />
          </div>
        )}
        {suggestions && (
          <div className="mt-1 w-full flex gap-4 overflow-auto no-scrollbar">
            {suggestions.map((suggestion, index) => (
              <TripSuggestionComponent
                key={index}
                suggestion={suggestion}
                trainStations={trainStations}
              />
            ))}
          </div>
        )}
        {noResults && (
          <div className="w-full flex items-center flex-col">
            <p>
              Aucun boyage depuis {fromStation?.name} n&apos;a été trouvé pour
              vos dates
            </p>
            <Image
              src="/not-found.png"
              alt="Not found"
              className="object-fill relative"
              width={300}
              height={300}
            ></Image>
          </div>
        )}
        <DialogFooter>
          <Button
            className="w-full flex flex-col py-6 bg-[#14708a]"
            onClick={handleGetSuggestions}
            disabled={isLoading || !date?.from || !date.to}
          >
            {isLoading ? (
              <LoadingSpinner className="mr-2" />
            ) : (
              <span className="flex gap-1 text-sm">
                Proposez-moi des voyages
                <Sparkles />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
