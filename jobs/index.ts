// @ts-ignore
import { updateJourneys } from './journeys.ts'
// @ts-ignore
import { refreshTrips } from './trips.ts'

// @ts-ignore
Deno.cron('Update journeys', '50 4 * * *', updateJourneys)

// @ts-ignore
Deno.cron('Refresh trips', '0 5 * * *', refreshTrips)
