import * as z from "zod";
import { ChatGoogle } from "@langchain/google-gauth";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { DynamicStructuredTool, tool } from "@langchain/core/tools";

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
const getWeather: DynamicStructuredTool = tool( getWeatherFunc, getWeatherFields );

const tools: DynamicStructuredTool[] = [
  getWeather,
]

const modelName = "gemini-2.5-flash-lite";
const model = new ChatGoogle({
  model: modelName,
}).bindTools( tools );

const prompt = process.argv[2] || "Who are you?";

const messages: BaseMessage[] = [
  new HumanMessage( prompt ),
];

const response = await model.invoke( messages );

console.log( JSON.stringify(response, null, 1) );
// console.log( response.text );
