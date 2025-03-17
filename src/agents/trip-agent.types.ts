import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { canGoFromTo } from '@/app/api/journeys/utils'

export const TripAgentResponseSchema = z.array(
  z
    .object({
      canGo: z.boolean().describe('Whether the user can go on the trip.'),
      route_from: z
        .array(
          z.array(
            z.object({
              origine: z.string().describe('The starting point of the trip.'),
              destination: z.string().describe('The destination of the trip.'),
              train_no: z.string().describe('The train number'),
              origine_iata: z
                .string()
                .describe('The starting point of the trip.'),
              destination_iata: z
                .string()
                .describe('The destination of the trip.'),
              heure_depart: z
                .date()
                .describe('The departure time of the trip.'),
              heure_arrivee: z.date().describe('The arrival time of the trip.'),
              date: z.date().describe('The date of the trip.'),
            })
          )
        )
        .describe('The route to go from - to of the trip.'),
      route_to: z
        .array(
          z.array(
            z.object({
              origine: z.string().describe('The starting point of the trip.'),
              destination: z.string().describe('The destination of the trip.'),
              train_no: z.string().describe('The train number'),
              origine_iata: z
                .string()
                .describe('The starting point of the trip.'),
              destination_iata: z
                .string()
                .describe('The destination of the trip.'),
              heure_depart: z
                .date()
                .describe('The departure time of the trip.'),
              heure_arrivee: z.date().describe('The arrival time of the trip.'),
              date: z.date().describe('The date of the trip.'),
            })
          )
        )
        .describe('The route to go to - from of the trip.'),
    })
    .describe(
      'The result of your evaluation e.g. {"canGo": true, "route_from": [], "route_to": []}'
    )
)

export type TripAgentResponse = z.infer<typeof TripAgentResponseSchema>

export const JsonifiedTripAgentResponseSchema = JSON.stringify(
  zodToJsonSchema(TripAgentResponseSchema, 'ExpectedResponseFormat')
)

export const TripAgentResponseExamples = `
Example Response 1:
[{
  "canGo": true,
  "route_from": [
    [{
      "origine": "Paris Gare de Lyon",
      "train_no": "1234",
      "destination": "Lyon Part Dieu", 
      "origine_iata": "FRPLY",
      "destination_iata": "FRLPD",
      "heure_depart": "2024-02-15T09:00:00.000Z",
      "heure_arrivee": "2024-02-15T11:00:00.000Z",
      "date": "2024-02-15T00:00:00.000Z"
    }]
  ],
  route_to: [
    [{
        "origine": "Lyon Part Dieu",
        "destination": "Paris Gare de Lyon",
        "train_no": "1234",
        "origine_iata": "FRLPD",
        "destination_iata": "FRPLY",
        "heure_depart": "2024-02-17T12:00:00.000Z",
        "heure_arrivee": "2024-02-17T14:00:00.000Z",
        "date": "2024-02-17T00:00:00.000Z"
        }]
    ],
  "from": "FRPLY",
  "to": "FRLPD"
}]

Example Response 2:
[{
  "canGo": true,
  "route_from": [
    [{
      "origine": "Paris Gare de Lyon",
      "destination": "Marseille Saint Charles",
      "train_no": "1234",
      "origine_iata": "FRPLY", 
      "destination_iata": "FRMSC",
      "heure_depart": "2024-02-16T10:00:00.000Z",
      "heure_arrivee": "2024-02-16T13:30:00.000Z",
      "date": "2024-02-16T00:00:00.000Z"
    },
    {
      "origine": "Marseille Saint Charles",
      "destination": "Nice Ville",
      "train_no": "1234",
      "origine_iata": "FRMSC",
      "destination_iata": "FRNIC", 
      "heure_depart": "2024-02-16T14:00:00.000Z",
      "heure_arrivee": "2024-02-16T15:30:00.000Z",
      "date": "2024-02-16T00:00:00.000Z"
    }]
  ]
  "route_to": [
    [{
      "origine": "Nice Ville",
      "destination": "Marseille Saint Charles",
      "origine_iata": "FRNIC",
      "train_no": "1234",
      "destination_iata": "FRMSC",
      "heure_depart": "2024-02-18T10:00:00.000Z",
      "heure_arrivee": "2024-02-18T11:30:00.000Z",
      "date": "2024-02-18T00:00:00.000Z"
    },
    {
      "origine": "Marseille Saint Charles",
      "destination": "Paris Gare de Lyon",
      "train_no": "1234",
      "origine_iata": "FRMSC",
      "destination_iata": "FRPLY",
      "heure_depart": "2024-02-18T12:00:00.000Z",
      "heure_arrivee": "2024-02-18T15:30:00.000Z",
      "date": "2024-02-18T00:00:00.000Z"
    }]
  ],
  "from": "FRPLY",
  "to": "FRNIC"
}]

Example Response 3:
[{
  "canGo": false,
  "route_from": [],
  "route_to": [],
  "from": "FRLPD",
  "to": "FRNTE"
}]
`

export const JourneySchema = z.object({
  train_no: z.string().describe('The train number'),
  origine: z.string().describe('The starting point of the journey'),
  destination: z.string().describe('The destination of the journey'),
  origine_iata: z.string().describe('The starting point IATA code'),
  destination_iata: z.string().describe('The destination IATA code'),
  date: z.date().describe('The date of the journey'),
  heure_depart: z.string().describe('The departure time of the journey'),
  heure_arrivee: z.string().describe('The arrival time of the journey'),
})

const TripAvailableToolSchema = z.object({
  from: z.string().describe('The starting point of the trip (IATA code)'),
  to: z.string().describe('The destination of the trip (IATA code)'),
  fromDate: z
    .string()
    .describe('The departure date of the trip in YYYY-MM-DD format'),
  toDate: z
    .string()
    .describe('The return date of the trip in YYYY-MM-DD format'),
})

export const JsonifiedTripAvailableToolSchema = JSON.stringify(
  zodToJsonSchema(TripAvailableToolSchema, 'TripAvailableToolInputSchema')
)

export const tripAvalableTool = tool(
  async ({ from, to, fromDate, toDate }) => {
    console.log(
      `Checking if a round trip is available between ${from} and ${to}`
    )

    const fromAtMidnight = new Date(fromDate)
    fromAtMidnight.setHours(0, 0)
    const result_from = await canGoFromTo(
      from,
      to,
      new Date(fromDate),
      fromAtMidnight
    )
    const result_to = await canGoFromTo(
      to,
      from,
      new Date(toDate),
      new Date(toDate)
    )

    console.log(
      `Finished round trip is available between ${from} and ${to}, canGo: ${
        result_from.canGo && result_to.canGo
      }`
    )

    const canGo = result_from.canGo && result_to.canGo

    return JSON.stringify({
      canGo,
      route_to: canGo
        ? result_to.posibilities?.map((posibility) => posibility.history)
        : [],
      route_from: canGo
        ? result_from.posibilities?.map((posibility) => posibility.history)
        : [],
      from,
      to,
    })
  },
  {
    name: 'trip_available',
    description: 'Check if a round trip is available between two stations',
    schema: TripAvailableToolSchema,
    returnDirect: false,
  }
)
