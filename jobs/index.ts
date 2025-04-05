// @ts-ignore
import { updateJourneys } from './journeys.ts'
// @ts-ignore
import { refreshTrips } from './trips.ts'

// @ts-ignore
Deno.cron('Update journeys', '0 */4 * * *', updateJourneys)

// @ts-ignore
Deno.cron('Refresh trips', '0 5 * * *', refreshTrips)
