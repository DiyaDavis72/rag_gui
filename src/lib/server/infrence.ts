import { readNdjsonStream } from "$lib/utils/stream";
import { query as inferenceQuery } from "./network/query";
import { retrieve } from "./retrieve";
import { systemPrompt } from "./system-prompt";
import type { AssistantMessage, History, Retrieved, ToolCalls } from "./types";
import {
  executeSearchTool,
  validateAgentToolQuery,
} from "./utils/inference-utils";
import { renderRetrieval } from "./utils/render-retrieval";

export const inference = async ({
  candidates,
  query,
  temperature,
  think,
  model,
  onToolCall,
  onThinking,
  onToken,
  onStatus,
  onError,
}: {
  candidates: Retrieved[];
  query: string;
  temperature: number;
  think: boolean;
  model: string;
  onToolCall?: (query: string, newCandidates: Retrieved[]) => void;
  onToken?: (token: string) => void;
  onThinking?: (think: string) => void;
  onStatus?: (status: "searching" | "inference") => void;
  onError: (error: string) => void;
}) => {
  let toolCallExhausted = 0;
  const MAX_TOOL_CALLS = 3;

  const history: History[] = [];

  const updateHistory = (...entries: History[]) => {
    history.push(...entries);
  };

  updateHistory(
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: renderRetrieval({ query, toolCallExhausted, candidates }),
      raw: { query, candidates },
    },
  );

  const send = async (): Promise<AssistantMessage | null> => {
    onStatus?.("inference");
    // ---------- Inference ----------
    const inferenceRes = await inferenceQuery({
      messages: history.map((h) => {
        const copy = { ...h };
        delete copy.raw;
        return copy;
      }),
      think,
      temperature,
      model,
    });

    if (!inferenceRes.ok) {
      const errText = await inferenceRes.text();
      onError(`Ollama error (${inferenceRes.status}): ${errText}`);
      return null;
    }

    if (!inferenceRes.body) {
      onError("Inference failed: empty response body");
      return null;
    }

    let fullContent = "";
    let toolCalls: ToolCalls[] = [];

    const stream = readNdjsonStream<{
      error: string;
      message: AssistantMessage;
    }>(inferenceRes);

    for await (const line of stream) {
      if (line.error) {
        onError(`Ollama stream error: ${line.error}`);
        return null;
      }

      if (line.message?.thinking) {
        onThinking?.(line.message?.thinking);
      }

      if (line.message?.content) {
        fullContent += line.message.content;
        onToken?.(line.message.content);
      }

      if (line.message?.tool_calls) {
        toolCalls = line.message.tool_calls;
      }
    }

    return {
      role: "assistant",
      content: fullContent,
      tool_calls: toolCalls.length ? toolCalls : undefined,
    };
  };

  let answer: string | null = null;

  while (true) {
    const agentMessage: AssistantMessage | null = await send();
    if (!agentMessage) {
      return null;
    }

    // If the model did not request any tools, this is the final answer!
    if (!agentMessage.tool_calls || agentMessage.tool_calls.length === 0) {
      updateHistory({
        role: "assistant",
        content: agentMessage.content,
      });
      answer = agentMessage.content;
      break;
    }

    // The model wants to call tools. Record assistant message with tool_calls.
    updateHistory({
      role: "assistant",
      content: agentMessage.content || "",
      tool_calls: agentMessage.tool_calls,
    });

    // Check if search limit is reached
    if (toolCallExhausted >= MAX_TOOL_CALLS) {
      updateHistory({
        role: "user",
        content:
          "Maximum search limit reached. Do not invoke any more tools. Please provide your definitive final response now based strictly on all excerpts retrieved above.",
      });
      continue;
    }

    onStatus?.("searching");

    let executedAnyTool = false;

    for (const tool of agentMessage.tool_calls) {
      if (tool.function.name === "search") {
        const searchQuery = tool.function.arguments?.query?.trim();
        const toolName = tool.function.name;

        const validationResult = validateAgentToolQuery({
          query: searchQuery,
          history,
        });

        if (!validationResult.valid) {
          const reason = validationResult.reason ?? "Unknown";
          updateHistory({
            role: "tool",
            content: `${reason}. Please provide new search keyword.`,
            tool_name: toolName,
          });
          toolCallExhausted++;
          executedAnyTool = true;
          continue;
        }

        const newCandidates = await executeSearchTool({
          query: searchQuery,
          history,
        });

        updateHistory({
          role: "tool",
          content: renderRetrieval({
            query: searchQuery,
            candidates: newCandidates,
            toolCallExhausted: toolCallExhausted + 1,
            ...(newCandidates.length
              ? {}
              : { warning: "No new chunks found against this query." }),
          }),
          tool_name: toolName,
          raw: {
            query: searchQuery,
            candidates: newCandidates,
          },
        });

        onToolCall?.(searchQuery, newCandidates);
        toolCallExhausted++;
        executedAnyTool = true;
      }
    }

    if (!executedAnyTool) {
      // No recognizable tool was called
      break;
    }
  }

  if (!answer || answer.trim() === "") {
    onError("Failed to generate response");
    return null;
  }

  return answer;
};
