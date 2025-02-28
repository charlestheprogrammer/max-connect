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

export default function SearchState() {
  const searchParams = useSearchParams()
  const router = useRouter()

  return (
    <div className="flex flex-col justify-between w-full md:h-12 gap-4 md:flex-row">
      <div className="bg-[#242B35] md:h-full flex-[6_1_auto] rounded-lg flex flex-row gap-2 h-12">
        <div className="flex-1 flex items-center px-3 gap-1">
          <span className="text-muted-foreground">Départ :</span>
          <span className="text-white">{searchParams.get('from')}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative flex items-center justify-center h-12">
                <div className="bg-[#0C131F] w-[2px] absolute left-1/2 h-12 -translate-x-1/2"></div>
                <div
                  className="w-9 h-9 rounded-full bg-[#0C131F] relative flex items-center justify-center cursor-pointer"
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
        <div className="flex-1 flex items-center px-3 gap-1">
          <span className="text-muted-foreground">Arrivée :</span>
          <span className="text-white">{searchParams.get('to')}</span>
        </div>
      </div>
      <div className="bg-[#242B35] md:h-full flex-[2_1_auto] rounded-lg flex flex-row gap-2 h-12">
        <div className="flex items-center px-3 gap-1 flex-1">
          <span className="text-muted-foreground">Aller :</span>
          <span className="text-white">
            {formatTripDate(new Date(searchParams.get('fromDate') as string))}
          </span>
        </div>
        <div className="w-[2px] bg-[#0C131F] h-full"></div>
        <div className="flex items-center px-3 gap-1 flex-1">
          <span className="text-muted-foreground">Retour :</span>
          <span className="text-white">
            {searchParams.get('toDate') &&
              formatTripDate(new Date(searchParams.get('toDate') as string))}
          </span>
        </div>
      </div>
    </div>
  )
}
