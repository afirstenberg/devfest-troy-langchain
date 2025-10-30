import * as z from "zod";
import { ChatGoogle } from "@langchain/google-gauth";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { type StructuredTool, tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { lastMsg, msgsToTxt } from "../util.js";

type getWeatherParams = {
  city: string
}
const getWeatherFunc = function( params: getWeatherParams ): string {
  return `It's always sunny in ${params.city}`;
}
const getWeatherFields = {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string(),
  })
}
const getWeather: StructuredTool = tool( getWeatherFunc, getWeatherFields );

const tools: StructuredTool[] = [
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

const responseMessages: BaseMessage[] = response.messages;
const lastMessage: BaseMessage | undefined = lastMsg( responseMessages );

// console.log( JSON.stringify(response, null, 1) );
// console.log( msgsToTxt(responseMessages) );
console.log( lastMessage?.text );
