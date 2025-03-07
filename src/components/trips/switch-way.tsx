'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SwitchWay() {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <Tabs defaultValue={searchParams.get('way') ?? 'from'} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="from"
          onClick={() => router.push('?way=from')}
          className="data-[state=active]:bg-[#14708a] data-[state=active]:text-white"
        >
          Aller
        </TabsTrigger>

        <TabsTrigger
          value="to"
          onClick={() => router.push('?way=to')}
          className="data-[state=active]:bg-[#14708a] data-[state=active]:text-white"
        >
          Retour
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
