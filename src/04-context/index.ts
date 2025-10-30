import * as z from "zod";
import { ChatGoogle } from "@langchain/google-gauth";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  StructuredTool,
  tool,
  type ToolRunnableConfig
} from "@langchain/core/tools";
import { createAgent, type Runtime } from "langchain";
import { lastMsg, msgsToTxt } from "../util.js";
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { MemorySaver } from "@langchain/langgraph";

type AgentContext = {
  userId: string;
}
type AgentConfig = ToolRunnableConfig<Record<string,any>, AgentContext>;

type getWeatherParams = {
  city: string;
}
function getWeatherFunc( params: getWeatherParams ): string {
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

function getLocationFunc( _: unknown, config: AgentConfig ): string {
  const { userId }: AgentContext = config.context!;
  return userId === "6" ? "The Village" : "Troy";
}
const getLocationFields = {
  name: "get_location",
  description: "Retrieve the user's information based on their User ID"
}
const getLocation: StructuredTool = tool( getLocationFunc, getLocationFields );

const tools: StructuredTool[] = [
  getWeather,
  getLocation,
]

const modelName = "gemini-2.5-flash";
const model = new ChatGoogle({
  model: modelName,
  maxReasoningTokens: 0,  // aka - "thinkingBudget"
});
const systemPrompt = `You are an expert weather forecaster.

You have access to two tools:
- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. 
If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.
`;
const checkpointer = new MemorySaver();
const agent = createAgent({
  model,
  tools,
  systemPrompt,
  checkpointer,
});

const id = process.argv[2] || "0";
const context: AgentContext = {
  userId: id,
}
const config: AgentConfig = {
  configurable: { thread_id: "1" },
  context,
}

const rl = readline.createInterface({ input, output });

while( true ){

  const prompt = await rl.question('You: ');

  const messages: BaseMessage[] = [
    new HumanMessage( prompt ),
  ];

  const response = await agent.invoke({
    messages,
  }, config );

  const responseMessages: BaseMessage[] = response.messages;
  const lastMessage: BaseMessage | undefined = lastMsg( responseMessages );

  // console.log( JSON.stringify(response, null, 1) );
  console.log( msgsToTxt(responseMessages) );
  console.log( lastMessage?.text );

}
