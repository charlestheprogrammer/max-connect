'use client'

import { formatTripDate } from '@/lib/utils'
import { ArrowLeftRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import TrainStation from '@/app/api/models/train-station'

export default function SearchState({
  trainStations,
}: {
  trainStations: TrainStation[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  return (
    <div className="flex flex-col justify-between w-full md:h-12 gap-4 md:flex-row">
      <div className="bg-[#242B35] md:h-full flex-[5_1_auto] rounded-lg flex md:flex-row md:gap-2 md:h-12 flex-col h-[6rem] relative">
        <div className="flex-1 flex items-center px-3 gap-1">
          <span className="text-muted-foreground">Départ :</span>
          <span className="text-white">
            {trainStations.find((d) => d.iata === searchParams.get('from'))
              ?.name || searchParams.get('from')}
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="md:relative flex items-center justify-center md:h-12 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 md:rotate-0 md:translate-y-0 md:top-0">
                <div className="bg-[#0C131F] w-[2px] absolute left-1/2 h-12 -translate-x-1/2 hidden md:block"></div>
                <div
                  className="md:w-9 md:h-9 h-12 w-12 rounded-full bg-[#0C131F] relative flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    const toDate = searchParams.get('toDate')
                      ? `&toDate=${searchParams.get('toDate')}`
                      : ''
                    router.push(
                      `/book?from=${searchParams.get(
                        'to'
                      )}&to=${searchParams.get(
                        'from'
                      )}&fromDate=${searchParams.get('fromDate')}${toDate}`
                    )
                  }}
                >
                  <ArrowLeftRight color="#fff" size={18} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Échanger les destinations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="md:hidden w-full h-[2px] bg-[#0C131F]"></div>
        <div className="flex-1 flex items-center px-3 gap-1">
          <span className="text-muted-foreground">Arrivée :</span>
          <span className="text-white">
            {trainStations.find((d) => d.iata === searchParams.get('to'))
              ?.name || searchParams.get('to')}
          </span>
        </div>
      </div>
      <div className="bg-[#242B35] md:h-full flex-[3_1_auto] rounded-lg flex flex-row gap-2 h-12">
        <div className="flex items-center px-3 gap-1 flex-1 justify-center md:justify-start">
          <span className="text-muted-foreground md:block hidden">Aller :</span>
          <span className="text-white">
            {formatTripDate(
              new Date(searchParams.get('fromDate') as string),
              false
            )}
          </span>
        </div>
        <div className="w-[2px] bg-[#0C131F] h-full"></div>
        <div className="flex items-center px-3 gap-1 flex-1 justify-center md:justify-start">
          <span className="text-muted-foreground md:block hidden">
            Retour :
          </span>
          <span className="text-white">
            {searchParams.get('toDate') &&
              formatTripDate(
                new Date(searchParams.get('toDate') as string),
                false
              )}
          </span>
        </div>
      </div>
    </div>
  )
}
