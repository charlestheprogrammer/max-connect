import { auth } from '@/auth'
import LoginButton from '@/components/login-button'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/server/supabase'
import Image from 'next/image'
import Link from 'next/link'
import TrainStation from '../api/models/train-station'
import Alert from '@/components/alerts/alert'
import AlertModel from '@/app/api/models/alert'
import { connect } from '@/utils/server/mongoose'

export default async function Home() {
  const supabase = await createClient()
  const { data } = (await supabase.from('train-station').select()) as {
    data: TrainStation[]
  }
  const session = await auth()

  await connect()

  const alerts = session
    ? (
        await AlertModel.find({ user: session.user._id })
          .sort({ date: 1 })
          .exec()
      ).map((alert) => ({
        id: alert._id.toString(),
        origine: alert.origine,
        destination: alert.destination,
        date: alert.date,
      }))
    : []

  if (!data) {
    return <div>loading...</div>
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-nunito-sans)] bg-[#F3F3F8]">
      <main className="flex flex-col items-center justify-end bg-[#0C131F] h-[240px] relative">
        <Link href={'/'}>
          <Image
            src="/sncf-connect.svg"
            alt="SNCF Connect logo"
            className="absolute top-4 left-4"
            width={130}
            height={64}
            priority
          />
        </Link>
        <div className="absolute top-4 right-4 flex items-center">
          {session && (
            <Link href="/alerts">
              <Button variant="ghost" className="text-white">
                <span>Mes alertes</span>
              </Button>
            </Link>
          )}
          <LoginButton session={session} />
        </div>
        <SearchBar trainStations={data} className="translate-y-1/2" />
      </main>
      <div className="w-11/12 max-w-[1000px] mx-auto p-4 mt-[200px] md:mt-[150px] grid grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <Alert alert={alert} trainStations={data} key={alert.id} />
        ))}
      </div>
    </div>
  )
}
