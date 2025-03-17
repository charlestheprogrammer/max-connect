import { TripAgentHumanPrompt, TripAgentPrompt } from './trip-agent.prompt'
import { tripAvalableTool } from './trip-agent.types'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { ChatOpenAI } from '@langchain/openai'
import { SuggestedTrip } from '@/app/api/models/suggested-trip'

export class TripAgent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: DynamicStructuredTool<any>[]
  constructor() {
    this.tools = [tripAvalableTool]
  }

  async suggestTrips(
    from: string,
    fromDate: Date,
    toDate: Date,
    customRequest?: string
  ): Promise<SuggestedTrip[] | null> {
    const systemMessage = await new TripAgentPrompt().getSystemMessage()

    const humanMessage = new TripAgentHumanPrompt().getHumanMessage({
      from,
      fromDate,
      toDate,
      customRequest,
    })

    const chat = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    })

    const agent = createReactAgent({
      llm: chat,
      tools: this.tools,
      messageModifier: systemMessage,
    })

    const messages = [humanMessage]

    const eventStream = agent.streamEvents({ messages }, { version: 'v2' })

    const textEncoder = new TextEncoder()
    const transformStream = new ReadableStream({
      async start(controller) {
        for await (const { event, data } of eventStream) {
          if (event === 'on_chat_model_stream') {
            if (!!data.chunk.content) {
              controller.enqueue(textEncoder.encode(data.chunk.content))
            }
          }
        }
        controller.close()
      },
    })

    const response = await new Response(transformStream).json()

    return response
  }
}
