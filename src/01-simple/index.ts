import { ChatGoogle } from "@langchain/google-gauth";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";

const modelName = "gemini-2.5-flash-lite";
const model = new ChatGoogle({
  model: modelName,
});

const messages: BaseMessage[] = [
  new HumanMessage("Who are you?"),
];

const response = await model.invoke( messages );

// console.log( response );
console.log( response.text );
