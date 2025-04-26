'use client'

import React from 'react'
import AlertSmall from '../alerts/alert-small'
import TrainStation from '@/app/api/models/train-station'
import Alert from '@/app/api/models/alert'

export default function Alerts({ data }: { data: TrainStation[] }) {
  const [alerts, setAlerts] = React.useState<Alert[]>([])

  React.useEffect(() => {
    fetch('/api/alerts')
      .then((res) => {
        if (!res.ok) {
          return []
        }
        return res.json()
      })
      .then((data) => {
        setAlerts(data)
      })
      .catch((err) => {
        console.error('Error fetching alerts:', err)
        setAlerts([])
      })
  }, [])

  return (
    <>
      {alerts.map((alert) => (
        <AlertSmall
          alert={alert}
          trainStations={data}
          key={alert._id.toString()}
        />
      ))}
    </>
  )
}
