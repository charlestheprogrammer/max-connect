import { ExternalLink } from 'lucide-react'
import { SearchBar } from '@/components/search-bar'
import { createClient } from '@/utils/server/supabase'

export default async function Home() {
  const supabase = await createClient()
  const { data, } = await supabase.from('train-station').select()

  if (!data) {
    return <div>loading...</div>
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[#0C131F]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <SearchBar trainStations={data} />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/charlestheprogrammer/max-connect"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={20} color="#666666" />
          GitHub
        </a>
      </footer>
    </div>
  )
}
