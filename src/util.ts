import { AIMessage, type BaseMessage, type ContentBlock } from "@langchain/core/messages";
import type { ToolCall } from "@langchain/core/messages/tool";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "node:child_process";


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

export function handleImageBlock( block: ContentBlock.Multimodal.DataRecordBase64 ): string {
  const data = block.data;
  const mimeType = block.mimeType;
  const extension = mimeType.split('/')[1];
  const fileName = `${new Date().getTime()}.${extension}`;
  const filePath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(filePath, data, 'base64');
  execSync(`open ${filePath}`);
  return filePath;
}

export function msgContent( message: BaseMessage ): string[] {
  const blocks: ContentBlock.Standard[] = message.contentBlocks;
  return blocks.map( block => {
    switch( block.type ){
      case "image":
        return handleImageBlock( block as ContentBlock.Multimodal );
      default:
        return block.text as string ?? "";
    }
  })
}