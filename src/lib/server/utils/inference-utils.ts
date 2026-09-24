import { retrieve } from "../retrieve";
import type { History, Retrieved } from "../types";
export const validateAgentToolQuery = ({
  query,
  history,
}: {
  query: string;
  history: History[];
}): {
  valid: boolean;
  reason?: "empty search query" | "repeat search query";
} => {
  if (!query.trim()) return { valid: false, reason: "empty search query" };

  if (
    history.some((h) =>
      h?.raw ? h.raw.query.toLowerCase() === query.toLowerCase() : false,
    )
  )
    return { valid: false, reason: "empty search query" };

  return { valid: true };
};

export const executeSearchTool = async ({
  query,
  history,
}: {
  query: string;
  history: History[];
}): Promise<Retrieved[]> => {
  const newCandidates = await retrieve({
    query: query,
    limit: 3,
  });

  const existingIds = new Set(
    history.flatMap((h) => h.raw?.candidates || []).map((c) => c?.id),
  );

  return newCandidates.filter((nc) => !existingIds.has(nc.id));
};
