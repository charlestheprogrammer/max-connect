import React, { Fragment, useCallback } from 'react'
import { AvailableJourney } from './journeys'
import { differenceInHours, differenceInMinutes, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import Image from 'next/image'
import { formatTripDate } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export default function Journey({ journey }: { journey: AvailableJourney[] }) {
  const totalTime = useCallback(
    (start: Date, end: Date) => {
      const diffInMinutes = differenceInMinutes(end, start)
      if (diffInMinutes < 60) {
        return diffInMinutes + 'min'
      }
      return (
        differenceInHours(end, start) +
        'h' +
        (diffInMinutes % 60).toString().padStart(2, '0')
      )
    },
    [journey]
  )

  return (
    <Sheet>
      <SheetTrigger>
        <div className="flex flex-row gap-2">
          <div className="bg-white flex-1 rounded-lg py-3 pb-2">
            <div className="flex flex-row justify-between">
              <div className="text-left">
                <p className="px-3 capitalize font-medium">
                  <span className="font-bold">
                    {format(journey[0].heure_depart, 'HH:mm', {
                      locale: fr,
                    })}
                  </span>
                  {' ' + journey[0].origine.toLowerCase()}
                </p>
                <p className="px-3 capitalize font-medium">
                  <span className="font-bold">
                    {format(
                      journey.at(-1)?.heure_arrivee || new Date(),
                      'HH:mm',
                      {
                        locale: fr,
                      }
                    )}
                  </span>
                  {' ' + journey.at(-1)?.destination.toLowerCase()}
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
              <p className="text-muted-foreground text-sm">
                {totalTime(
                  journey[0].heure_depart,
                  journey.at(-1)?.heure_arrivee || new Date()
                )}
              </p>
              {journey.length > 1 ? (
                <p className="text-muted-foreground text-sm">
                  • {journey.length - 1} correspondance
                  {journey.length > 2 && 's'}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">• Direct</p>
              )}
            </div>
          </div>
          <div className="bg-white w-[120px] rounded-lg p-2 hidden md:flex flex-row items-center justify-center">
            <p className="font-bold text-lg">0 €</p>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="bg-[#F3F3F8] w-full sm:w-[540px] !max-w-full overflow-auto">
        <SheetHeader>
          <SheetTitle>Votre voyage</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Aller : {formatTripDate(journey[0].date)}
          </p>
          <Separator className="bg-gray-400" />
          <div className="text-left">
            <p className="capitalize">
              <span className="font-semibold">
                {format(journey[0].heure_depart, 'HH:mm', {
                  locale: fr,
                })}
              </span>
              {' ' + journey[0].origine.toLowerCase()}
            </p>
            <p className="capitalize">
              <span className="font-semibold">
                {format(journey.at(-1)?.heure_arrivee || new Date(), 'HH:mm', {
                  locale: fr,
                })}
              </span>
              {' ' + journey.at(-1)?.destination.toLowerCase()}
            </p>
          </div>
          <Separator className="bg-gray-400" />
          <div className="flex flex-row gap-2 items-center">
            <Clock color="#737373" size={14} />
            <p className="text-muted-foreground text-sm">
              {totalTime(
                journey[0].heure_depart,
                journey.at(-1)?.heure_arrivee || new Date()
              )}
            </p>
            {journey.length > 1 ? (
              <p className="text-muted-foreground text-sm">
                • {journey.length - 1} correspondance
                {journey.length > 2 && 's'}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">• Direct</p>
            )}
          </div>
        </SheetHeader>
        <h2 className="font-semibold text-lg mt-6">Détail du voyage</h2>
        <div className="bg-white w-full rounded-lg px-8 py-6 mt-2 flex flex-col">
          {journey.map((record, index) => (
            <Fragment key={`${index}`}>
              {index !== 0 && (
                <div className="flex flex-row gap-2 items-stretch h-[80px]">
                  <div className="flex flex-col justify-center items-end relative w-[60px] pr-[25px]">
                    <div className="w-[14px] bg-[#e3e3e8] absolute h-[calc(100%+30px)] right-[5px] rounded-full flex flex-col justify-between"></div>
                    <span className="text-sm text-muted-foreground">
                      {totalTime(
                        journey[index - 1].heure_arrivee,
                        record.heure_depart
                      )}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-muted-foreground">Correspondance</p>
                  </div>
                </div>
              )}
              <div className="flex flex-row gap-2 items-stretch z-10">
                <div className="flex flex-col justify-center items-end relative w-[60px] pr-[25px]">
                  <div className="w-[14px] bg-[#14708a] absolute h-[calc(100%-10px)] right-[5px] rounded-full flex flex-col justify-between">
                    <div className="w-[14px] bg-white h-[14px] rounded-full border-2 border-[#14708a]"></div>
                    <div className="w-[14px] bg-white h-[14px] rounded-full border-2 border-[#14708a]"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {totalTime(record.heure_depart, record.heure_arrivee)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium capitalize">
                    {format(record.heure_depart, 'HH:mm', { locale: fr })}{' '}
                    {record.origine.toLowerCase()}
                  </p>
                  <div className="bg-[#f3f3f8] p-3 rounded-lg my-4">
                    <div className="flex justify-between items-center">
                      <Image
                        src="/book/train.svg"
                        alt="train"
                        width={35}
                        height={35}
                        className="opacity-50"
                      />
                      <Image
                        src="/book/inoui.svg"
                        alt="train"
                        width={50}
                        height={50}
                      />
                    </div>
                    <p className="mt-1">
                      TGV INOUI{' '}
                      <span className="font-medium">n° {record.train_no}</span>
                    </p>
                  </div>
                  <p className="font-medium capitalize">
                    {format(record.heure_arrivee, 'HH:mm', { locale: fr })}{' '}
                    {record.destination.toLowerCase()}
                  </p>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
