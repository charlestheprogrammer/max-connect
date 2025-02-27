import Image from 'next/image'
import React from 'react'

export default function CurrentOffer({
  imageSrc,
  alt,
  from,
  to,
  price,
}: {
  imageSrc: string
  alt: string
  from: string
  to: string
  price: number
}) {
  return (
    <div className="bg-white p-1 w-[220px] shrink-0 rounded-lg overflow-hidden">
      <Image
        src={imageSrc}
        alt={alt}
        width={220}
        height={180}
        className="rounded-t-sm"
      />
      <div className="px-4 mt-5">
        <div className="h-[90px]">
          <h2 className="text-lg font-bold">{to}</h2>
          <p className="text-sm text-muted-foreground">Au départ de {from}</p>
        </div>
        <div className="mb-2">
          <p className="text-sm text-muted-foreground mb-1">À partir de</p>
          <div className="rounded-lg bg-[#F1C83C] size-fit px-3 py-2 font-bold flex flex-row gap-1">
            <p>{price} €</p>
            <p className="text-[10px] font-medium">(1)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
