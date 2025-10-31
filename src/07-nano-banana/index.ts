import { ChatGoogle } from "@langchain/google-gauth";
import { AIMessageChunk, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { msgContent } from "../util.js";

const modelName = "gemini-2.5-flash-image";
const model = new ChatGoogle({
  model: modelName,
});

const prompt = process.argv[2] || "Who are you?";

const messages: BaseMessage[] = [
  new HumanMessage( prompt ),
];

const response: AIMessageChunk = await model.invoke( messages );

// console.log( response );
// console.log( response.text );
console.log( msgContent(response) );