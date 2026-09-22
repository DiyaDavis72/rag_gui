import { query as inferenceQuery } from "./network/query";
import { retrieve } from "./retrieve";
import { systemPrompt } from "./system-prompt";
import type { Message, Retrieved, ToolCalls } from "./types";
import { renderRetrieval } from "./utils/render-retrieval";

export const inference = async ({
  candidates,
  query,
}: {
  candidates: Retrieved[];
  query: string;
}) => {
  let toolCallExhausted = 0;

  let breakLoop = false;

  const messages: Message[] = [];

  messages.push({ role: "system", content: systemPrompt });
  messages.push({
    role: "user",
    content: renderRetrieval({ query, candidates, toolCallExhausted }),
  });

  const queryHistory: { query: string; context: Retrieved[] }[] = [];

  queryHistory.push({ query, context: candidates });

  const send = async () => {
    // ---------- Inference ----------
    const inferenceRes = await inferenceQuery({
      messages,
      think: false,
    });
    const response = await inferenceRes.json();

    return response.message as Message;
  };

  let answer = null;

  while (toolCallExhausted !== 5 && breakLoop === false) {
    const agentMessage = await send();
    messages.push(agentMessage);
    answer = agentMessage.content;
    console.log(agentMessage);

    if (!agentMessage.tool_calls?.length) {
      breakLoop = true;
      continue;
    }

    console.log("LLM made a tool call - ", agentMessage.tool_calls);

    for (const tool of agentMessage.tool_calls) {
      if (tool.function.name === "search") {
        if (
          queryHistory.find(
            (h) =>
              h.query.toLowerCase() ===
              tool.function.arguments.query.toLowerCase(),
          )
        ) {
          console.log("Repeated search query detected");
          messages.push({
            role: "tool",
            content: renderRetrieval({
              query: tool.function.arguments.query,
              candidates: [],
              warning: "Repeated search query. Send a different search querty.",
              toolCallExhausted,
            }),
            tool_call_id: tool.id,
          });
          queryHistory.push({
            query: tool.function.arguments.query,
            context: [],
          });
          toolCallExhausted++;
          continue;
        }

        const newCandidates = await retrieve({
          query: tool.function.arguments.query,
        });

        const existing = new Set(
          queryHistory.flatMap((h) => h.context).map((c) => c.id),
        );

        const deduped = newCandidates.filter((nc) => !existing.has(nc.id));

        messages.push({
          role: "tool",
          content: renderRetrieval({
            query: tool.function.arguments.query,
            candidates: deduped,
            toolCallExhausted,
            ...(deduped.length
              ? {}
              : { warning: "No new chunks found against this query." }),
          }),
          tool_call_id: tool.id,
        });
        queryHistory.push({
          query: tool.function.arguments.query,
          context: deduped,
        });
        toolCallExhausted++;
      }
    }
  }
  if (!answer) {
    console.log("Failed to generate answer");
    process.exit(1);
  }
  return answer;
};
