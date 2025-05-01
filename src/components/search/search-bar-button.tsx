import React, { Fragment } from 'react'
import { Label } from '@/components/ui/label'
import TrainStation from '@/app/api/models/train-station'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'

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
  inline = false,
  inputOnly = false,
}: {
  type: string
  id: string
  value: string
  setValue: (value: string) => void
  setTrainStation: (value: TrainStation | null) => void
  trainStations: TrainStation[]
  inline?: boolean
  inputOnly?: boolean
}) {
  const [availableStations, setAvailableStations] = React.useState<
    TrainStation[]
  >([])

  React.useEffect(() => {
    setAvailableStations(computeAvailableStations(value, trainStations))
  }, [value, trainStations])

  const [isFocus, setIsFocus] = React.useState(false)

  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex flex-col relative md:h-full flex-1',
        inputOnly && 'w-full',
        !inputOnly && 'w-full md:w-auto'
      )}
    >
      <div
        className={cn(
          'flex items-start transition-colors rounded-md cursor-pointer h-full',
          !inline && 'flex-col justify-center ',
          inline && 'flex-1 flex items-center px-3 gap-1 w-full',
          !inputOnly &&
            !inline &&
            'hover:bg-accent hover:text-accent-foreground p-2'
        )}
      >
        {(value || inline) && !inputOnly && (
          <span
            className={cn(
              'text-muted-foreground text-base',
              !inline && 'text-sm font-normal'
            )}
          >
            {type} {inline && ':'}
          </span>
        )}
        <span
          className={cn(
            inline && 'text-white flex-1 text-base',
            !inline && 'text-sm w-full'
          )}
        >
          <input
            type="text"
            id={id}
            placeholder={type}
            className={cn(
              'outline-none bg-transparent font-normal w-full text-base',
              !inline && 'text-sm',
              !inputOnly && 'border-none shadow-none focus-visible:ring-0',
              inputOnly && 'border border-input rounded-md p-2 shadow-sm',
            )}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setTrainStation(null)
            }}
            onFocus={() => {
              setAvailableStations(
                computeAvailableStations(value, trainStations)
              )
              setIsFocus(true)
            }}
            onBlur={() =>
              setTimeout(() => {
                setIsFocus(false)
                setAvailableStations([])
              }, 200)
            }
          />
        </span>
      </div>
      {availableStations.length > 0 && isFocus && (
        <div
          className={cn(
            'absolute',
            inline ? 'top-[48px]' : inputOnly ? 'top-[30px]' : 'top-[60px]'
          )}
        >
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
