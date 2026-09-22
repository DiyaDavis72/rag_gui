import type { Retrieved } from "../types";

export const renderRetrieval = ({
  query,
  candidates,
  toolCallExhausted,
  warning,
}: {
  query: string;
  candidates: Retrieved[];
  toolCallExhausted: number;
  warning?: string;
}): string => {
  const sections: string[] = [];

  if (warning) {
    sections.push(`> [!WARNING]\n> ${warning}`);
  }

  sections.push(`## Question\n${query}`);

  if (candidates && candidates.length > 0) {
    const excerpts = candidates
      .map((c) => c.text)
      .join("\n\n---\n\n");
    sections.push(`## Context Excerpts\n\n${excerpts}`);
  } else {
    sections.push(
      `## Context Excerpts\n\n*(No excerpts available in initial context)*`,
    );
  }

  sections.push(`*Tool calls remaining: ${5 - toolCallExhausted}*`);

  return sections.join("\n\n");
};
