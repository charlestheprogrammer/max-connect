import React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import TrainStation from '@/app/api/models/train-station'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PopoverClose } from '@radix-ui/react-popover'
import { toast } from 'sonner'
import SearchBarButton from '../search/search-bar-button'
import { useSession } from 'next-auth/react'

export default function TripPreferences({
  trainStations,
}: {
  trainStations: TrainStation[]
}) {
  const { status, data } = useSession()
  const [selectedOrigin, setSelectedOrigin] = React.useState<string>('')
  const [value, setValue] = React.useState<string>('')
  const [selectedWeekendStart, setSelectedWeekendStart] =
    React.useState<number>(0)
  const [selectedWeekendEnd, setSelectedWeekendEnd] = React.useState<number>(0)

  React.useEffect(() => {
    if (status === 'authenticated') {
      setSelectedOrigin(data.user.preferences?.favoriteOrigine ?? '')
      setValue(
        trainStations.find(
          (v) => v.iata === data.user.preferences?.favoriteOrigine
        )?.name ?? ''
      )
      setSelectedWeekendStart(data.user.preferences?.weekendStartingDay ?? 5)
      setSelectedWeekendEnd(data.user.preferences?.weekendEndingDay ?? 6)
    }
  }, [data, status])

  const handleUpdatePreferences = () => {
    // Handle the update preferences logic here
    const patchPreferences = new Promise<void>((resolve, reject) => {
      fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favoriteOrigin: selectedOrigin,
          weekendStart: selectedWeekendStart,
          weekendEnd: selectedWeekendEnd,
        }),
      })
        .then((res) => {
          if (res.ok) {
            resolve()
          } else {
            reject(new Error('Failed to update preferences'))
          }
        })
        .catch((err) => {
          reject(err)
        })
    })

    toast.promise(patchPreferences, {
      loading: 'Préférences en cours de mise à jour...',
      success: () => {
        return `Préférences mises à jour avec succès`
      },
      error: "Une erreur s'est produite lors de la mise à jour des préférences",
    })
  }

  if (status === 'loading') {
    return (
      <div className="h-12 w-12 border border-[#0C131F] rounded-full animate-pulse" />
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-12 w-12 border border-[#0C131F] rounded-full"
        >
          <Settings color="#0C131F" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Préferences</h4>
            <p className="text-sm text-muted-foreground">
              Définissez vos préférences pour les voyages suggérés
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="from-preference">Gare de départ</Label>
              <div className="col-span-2">
                <SearchBarButton
                  value={value}
                  setValue={setValue}
                  setTrainStation={(value) =>
                    setSelectedOrigin(value?.iata ?? '')
                  }
                  type="Départ"
                  id="from-preference"
                  trainStations={trainStations}
                  inputOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="weekendStart">Début du weekend</Label>
              <Select
                onValueChange={(value) =>
                  setSelectedWeekendStart(Number(value))
                }
                defaultValue={String(selectedWeekendStart)}
                value={String(selectedWeekendStart)}
              >
                <SelectTrigger className="w-[185px]">
                  <SelectValue placeholder="Sélectionnez un jour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Jours de la semaine</SelectLabel>
                    <SelectItem value="0">Lundi</SelectItem>
                    <SelectItem value="1">Mardi</SelectItem>
                    <SelectItem value="2">Mercredi</SelectItem>
                    <SelectItem value="3">Jeudi</SelectItem>
                    <SelectItem value="4">Vendredi</SelectItem>
                    <SelectItem value="5">Samedi</SelectItem>
                    <SelectItem value="6">Dimanche</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="weekendEnd">Fin du weekend</Label>
              <Select
                onValueChange={(value) => setSelectedWeekendEnd(Number(value))}
                value={String(selectedWeekendEnd)}
                defaultValue={String(selectedWeekendEnd)}
              >
                <SelectTrigger className="w-[185px]">
                  <SelectValue placeholder="Sélectionnez un jour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Jours de la semaine</SelectLabel>
                    <SelectItem value="0">Lundi</SelectItem>
                    <SelectItem value="1">Mardi</SelectItem>
                    <SelectItem value="2">Mercredi</SelectItem>
                    <SelectItem value="3">Jeudi</SelectItem>
                    <SelectItem value="4">Vendredi</SelectItem>
                    <SelectItem value="5">Samedi</SelectItem>
                    <SelectItem value="6">Dimanche</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <PopoverClose asChild>
            <Button variant="ghost" className="mr-2">
              Annuler
            </Button>
          </PopoverClose>
          <Button variant="default" onClick={handleUpdatePreferences}>
            Enregistrer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
