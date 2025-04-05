import { updateJourneys } from './journeys'
import { refreshTrips } from './trips'

// @ts-ignore
Deno.cron('Update journeys', '0 */4 * * *', updateJourneys)

// @ts-ignore
Deno.cron('Refresh trips', '0 5 * * *', refreshTrips)
