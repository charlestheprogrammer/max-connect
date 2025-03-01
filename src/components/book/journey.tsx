import React, { useCallback } from 'react'
import { AvailableJourney } from './journeys'
import { differenceInHours, differenceInMinutes, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock } from 'lucide-react'

export default function Journey({ journey }: { journey: AvailableJourney }) {
  const totalTime = useCallback(() => {
    const diffInMinutes = differenceInMinutes(
      journey.heure_arrivee,
      journey.heure_depart
    )
    if (diffInMinutes < 60) {
      return diffInMinutes + 'min'
    }
    return (
      differenceInHours(journey.heure_arrivee, journey.heure_depart) +
      'h' +
      (diffInMinutes % 60).toString().padStart(2, '0')
    )
  }, [journey.heure_arrivee, journey.heure_depart])

  return (
    <div className="flex flex-row gap-2">
      <div className="bg-white flex-1 rounded-lg py-3 pb-2">
        <div className="flex flex-row justify-between">
          <div>
            <p className="px-3 capitalize font-medium">
              <span className="font-bold">
                {format(journey.heure_depart, 'HH:mm', {
                  locale: fr,
                })}
              </span>
              {' ' + journey.origine.toLowerCase()}
            </p>
            <p className="px-3 capitalize font-medium">
              <span className="font-bold">
                {format(journey.heure_arrivee, 'HH:mm', {
                  locale: fr,
                })}
              </span>
              {' ' + journey.destination.toLowerCase()}
            </p>
          </div>
          <div className="block md:hidden px-3">
            <p className="text-muted-foreground text-end text-sm">dès</p>
            <p className="font-bold text-lg">0 €</p>
          </div>
        </div>
        <div className="h-[2px] bg-[#F3F3F8] w-full mt-3 mb-2"></div>
        <div className="flex flex-row gap-2 items-center px-3">
          <Clock color="#737373" size={14} />
          <p className="text-muted-foreground text-sm">{totalTime()}</p>
        </div>
      </div>
      <div className="bg-white w-[120px] rounded-lg p-2 hidden md:flex flex-row items-center justify-center">
        <p className="font-bold text-lg">0 €</p>
      </div>
    </div>
  )
}
