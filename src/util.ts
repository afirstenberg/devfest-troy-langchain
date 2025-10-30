import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import type { ToolCall } from "@langchain/core/messages/tool";

export function msgToTxt( msg: BaseMessage ): string {
  if( !msg ){
    return "";
  }
  const tools: ToolCall[] = (msg as AIMessage).tool_calls ?? [];
  const toolNames: string = tools.map( (tool: ToolCall): string => {
    const params = Object.keys( tool.args ).map( (key: string): string => {
      const val = tool.args[key];
      return `${key}=${val}`
    }).join(', ');
    return `${tool.name}(${params})`;
  }).join(', ');
  return `${msg.type}: ${toolNames} ${msg.text}`;
}

export function lastMsg( messages: BaseMessage[] | undefined ): BaseMessage | undefined {
  if( messages ){
    return messages[ messages.length - 1 ];
  } else {
    return undefined;
  }
}

export function msgsToTxt( messages: BaseMessage[] | undefined ): string[] {
  if( !messages ){
    return [];
  }
  return messages.map( (msg: BaseMessage): string => msgToTxt( msg ) );
}