import React, { Fragment } from 'react'
import { Label } from '@/components/ui/label'
import TrainStation from '@/app/api/models/train-station'
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
    station.name.toLowerCase().includes(value.toLowerCase())
  )
}

export default function SearchBarButton({
  type,
  id,
  value,
  setValue,
  setTrainStation,
  trainStations,
}: {
  type: string
  id: string
  value: string
  setValue: (value: string) => void
  setTrainStation: (value: TrainStation | null) => void
  trainStations: TrainStation[]
}) {
  const [availableStations, setAvailableStations] = React.useState<
    TrainStation[]
  >([])

  React.useEffect(() => {
    setAvailableStations(computeAvailableStations(value, trainStations))
  }, [value, trainStations])

  return (
    <Label htmlFor={id} className="flex flex-col relative w-full md:w-auto md:h-full flex-1">
      <div className="flex flex-col items-start justify-center transition-colors rounded-md hover:bg-accent hover:text-accent-foreground p-2 cursor-pointer h-full">
        {value && (
          <span className="text-muted-foreground text-sm font-normal">
            {type}
          </span>
        )}
        <span className="text-sm w-full">
          <input
            type="text"
            id={id}
            placeholder={type}
            className="outline-none bg-transparent text-sm font-normal w-full"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setTrainStation(null)
            }}
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
        <div className="absolute top-[60px]">
          <ScrollArea className="h-72 w-72 rounded-md border absolute bg-white shadow-lg z-10">
            <div className="p-2 py-4">
              <h4 className="mb-4 text-sm font-medium leading-none">
                Gares disponibles
              </h4>
              {availableStations.map((availableStation, index) => (
                <Fragment key={availableStation.id}>
                  {index > 0 && <Separator className="my-1" />}
                  <div
                    className="text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground p-2 rounded-md"
                    onClick={() => {
                      setValue(availableStation.name)
                      setTrainStation(availableStation)
                      setAvailableStations([])
                    }}
                  >
                    {availableStation.name}
                  </div>
                </Fragment>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Label>
  )
}
