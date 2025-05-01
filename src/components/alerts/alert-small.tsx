'use client'

import React from 'react'
import Link from 'next/link'
import { formatTripDate } from '@/lib/utils'
import { format } from 'date-fns'
import { BellRing, Calendar, Delete } from 'lucide-react'
import TrainStation from '@/app/api/models/train-station'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import Alert from '@/app/api/models/alert'

export default function AlertSmall({
  alert,
  trainStations,
}: {
  alert: Alert
  trainStations: TrainStation[]
}) {
  const [deleted, setDeleted] = React.useState(false)

  const deleteAlert = async () => {
    const res = await fetch(`/api/alerts`, {
      method: 'DELETE',
      body: JSON.stringify({ id: alert._id }),
    })
    if (res.status === 200) {
      setDeleted(true)
    }
  }

  if (deleted) return null

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link
          href={`/book?from=${alert.origine}&to=${
            alert.destination
          }&fromDate=${format(alert.date, 'yyyy-MM-d')}`}
        >
          <div className="bg-white p-3 shrink-0 rounded-lg flex justify-between items-center min-w-[330px] justify-between hover:shadow transition-shadow duration-200">
            <div className="flex gap-1 items-center">
              <BellRing
                size={20}
                className="inline-block mr-1 pt-1"
                color="#14708a"
                strokeWidth={2.5}
              />
              <div className="text-sm font-medium overflow-hidden text-nowrap flex gap-1">
                <p className="max-w-[100px] overflow-hidden text-ellipsis">
                  {
                    trainStations.find((v) => v.iata === alert.origine)
                      ?.name
                  }
                </p>
                {' • '}
                <p className="max-w-[100px] overflow-hidden text-ellipsis">
                  {trainStations.find((v) => v.iata === alert.destination)?.name}
                </p>
              </div>
            </div>
            <div className="flex gap-1 items-center text-sm text-muted-foreground">
              <Calendar size={13} className="inline-block" />
              <p>{formatTripDate(alert.date, false)}</p>
            </div>
          </div>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <ContextMenuItem onClick={deleteAlert}>
          Supprimer{' '}
          <ContextMenuShortcut>
            <Delete size={18} />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
