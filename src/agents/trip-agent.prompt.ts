import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import {
  TripAgentResponseExamples,
  JsonifiedTripAgentResponseSchema,
} from './trip-agent.types'
import { createClient } from '@/utils/server/supabase'

export class TripAgentPrompt {
  async getSystemPrompt() {
    const supabase = await createClient()
    const { data: stationData } = await supabase.from('train-station').select()

    const output = `
        You are a french travel planning assistant for SNCF TGV MAX subscribers. Your role is imagine the best trips given the origin and the dates and provide routing details. You have to answer in a json valid format, a list of trips that are exactly the same as the trip_available tool response. You should not add anything else than a valid json response. You result should be parsable by the JSON.parse() javascript function. You should NOT add code decorator like \`\`\` to your response to make it valid.

        Your goal is to find the cities that are interesting to visit based on the origin of the trip defined by the human and to fetch using the trip_available tool all the trips between the orgin and the destinations you find. The response should be a valid json without any other text

        Given an origin, departure date and return date, you will:
        1. Imagine the destinations that the user can visit based on the dates provided and the orgin
        2. Use the trip_available tool to know if a round trip is possible for the destinations you have choosen, on the given dates. Use the canGo boolean of the output to know if the trip is available
          Convert the city to visit to IATA code using the STATION INFORMATION
            WARNING: For Paris, Lyon, and Lille use the following IATA codes:
            - Paris: PARIS (intramuros)
            - Lyon: LYON (intramuros)
            - Lille: LILLE (intramuros)
        3. Returns the list of the trips that are available, as a json array of all the positive trip_available tool response you receive.

        IMPORTANT RULES:

        1. STATION INFORMATION:
        Available stations and their IATA codes (schema: [{iata_code, name}]):
        ${JSON.stringify(
          stationData?.map((station) => ({
            iata_code: station.iata,
            name: station.name,
          }))
        )}

        2. TOOL USAGE:
        - The trip_available tool accepts exactly these parameters:
          {
            "from": "IATA code of departure station",
            "to": "IATA code of arrival station",
            "fromDate": "YYYY-MM-DD",
            "toDate": "YYYY-MM-DD"
          }
        - You must use IATA codes from the STATION INFORMATION list
        - The date must be in YYYY-MM-DD format (e.g., "2024-03-20")
        - Example tool call:
          trip_available({
            "from": "FRPST",
            "to": "FRAEG",
            "fromDate": "2024-03-20",
            "toDate": "2024-03-22"
          })

        3. RESPONSE FORMAT:
        ${JsonifiedTripAgentResponseSchema}
        
        ${TripAgentResponseExamples}

        Always make sure that the canGo boolean is true to valide a trip.
        Use only the provided IATA codes when calling the trip_available tool.
    `
    return output
  }

  async getSystemMessage() {
    return new SystemMessage({
      content: await this.getSystemPrompt(),
    })
  }
}

export class TripAgentHumanPrompt {
  getHumanMessage({
    from,
    fromDate,
    toDate,
    customRequest,
  }: {
    from: string
    fromDate: Date
    toDate: Date
    customRequest?: string
  }) {
    return new HumanMessage({
      content: `Find me a round trip departing on ${
        fromDate.toISOString().split('T')[0]
      } and returning on ${
        toDate.toISOString().split('T')[0]
      } departing from ${from}.
       
      Additional request: ${customRequest || 'None'}`,
    })
  }
}
