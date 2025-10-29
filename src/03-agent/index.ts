import * as z from "zod";
import { ChatGoogle } from "@langchain/google-gauth";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import { createAgent } from "langchain";

const getWeatherFunc = function( city: string ): string {
  return `It's always sunny in ${city}`;
}
const getWeatherFields = {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string(),
  })
}
const getWeather: DynamicStructuredTool = tool( getWeatherFunc, getWeatherFields );

const tools: DynamicStructuredTool[] = [
  getWeather,
]

const modelName = "gemini-2.5-flash-lite";
const model = new ChatGoogle({
  model: modelName,
});
const agent = createAgent({
  model,
  tools,
});

const prompt = process.argv[2] || "Who are you?";

const messages: BaseMessage[] = [
  new HumanMessage( prompt ),
];

const response = await agent.invoke({
  messages
});

// console.log( JSON.stringify(response, null, 1) );
const responseMessages: BaseMessage[] = response.messages ?? [];
const lastMessage: BaseMessage | undefined = responseMessages[ responseMessages.length - 1 ];
console.log( lastMessage?.text );
