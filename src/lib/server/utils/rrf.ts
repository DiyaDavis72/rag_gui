import type { Retrieved } from "../types";

export const rrf = (semantic: Retrieved[], lexical: Retrieved[], k = 60) => {
  const fused = new Map<string, Retrieved>();

  const add = (results: Retrieved[]) => {
    results.forEach((result, index) => {
      const rank = index + 1;
      const score = 1 / (k + rank);

      const existing = fused.get(result.id);

      if (existing) {
        existing.score += score;
      } else {
        fused.set(result.id, {
          ...result,
          score: score,
        });
      }
    });
  };

  add(semantic);
  add(lexical);

  return [...fused.values()].sort((a, b) => b.score - a.score);
};
