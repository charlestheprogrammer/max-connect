import React from 'react'
import { Label } from '@/components/ui/label'
import TrainStation from '@/api/models/train-station'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'

const computeAvailableStations = (
  value: string,
  trainStations: TrainStation[]
) => {
  if (value.length < 3) {
    return []
  }
  return trainStations.filter((station) =>
    station.libelle.toLowerCase().includes(value.toLowerCase())
  )
}

export default function SearchBarButton({
  type,
  id,
  value,
  setValue,
  trainStations,
}: {
  type: string
  id: string
  value: string
  setValue: (value: string) => void
  trainStations: TrainStation[]
}) {
  const [availableStations, setAvailableStations] = React.useState<
    TrainStation[]
  >([])

  React.useEffect(() => {
    setAvailableStations(computeAvailableStations(value, trainStations))
  }, [value, trainStations])

  return (
    <Label htmlFor={id} className="flex flex-col relative">
      <div className="flex flex-col items-start justify-center transition-colors rounded-md hover:bg-accent hover:text-accent-foreground p-2 h-full cursor-pointer">
        {value && (
          <span className="text-muted-foreground text-sm font-normal">
            {type}
          </span>
        )}
        <span className="text-sm">
          <input
            type="text"
            id={id}
            placeholder={type}
            className="outline-none bg-transparent text-sm font-normal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() =>
              setAvailableStations(
                computeAvailableStations(value, trainStations)
              )
            }
            onBlur={() => setTimeout(() => setAvailableStations([]), 200)}
          />
        </span>
      </div>
      {availableStations.length > 0 && (
        <div className="absolute top-12">
          <ScrollArea className="h-72 w-72 rounded-md border absolute bg-white shadow-lg">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">
                Gares disponibles
              </h4>
              {availableStations.map((availableStation, index) => (
                <>
                  {index > 0 && <Separator className="my-2" />}
                  <div
                    key={availableStation.id}
                    className="text-sm"
                    onClick={() => {
                      setValue(availableStation.libelle)
                      setAvailableStations([])
                    }}
                  >
                    {availableStation.libelle}
                  </div>
                </>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Label>
  )
}
