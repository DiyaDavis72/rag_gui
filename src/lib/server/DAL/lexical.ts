import { db } from "../db/db";
import type { Retrieved } from "../types";
import { STOP_WORDS, RELEVANT_NOUNS } from "../constant";

export const getLexical = ({
  limit = 10,
  query,
}: {
  limit?: number;
  query: string;
}) => {
  const statement = db.prepare(`
  SELECT
    c.id,
    c.chapter_name,
    c.chapter_id,
    c.volume,
    c.text,
    bm25(chunks_fts) AS score
  FROM chunks_fts
  JOIN chunks c ON c.rowid = chunks_fts.rowid
  WHERE chunks_fts MATCH ?
  ORDER BY score
  LIMIT ${limit}
`);

  const normalizedQuery = query
    .replace(/['’]s\b/gi, "") // 1. Strip possessive 's (straight & curly quotes)
    .replace(/[^a-zA-Z0-9\s]/g, " ") // 2. Replace all grammar, quotes, and punctuation with a space
    .replace(/\s+/g, " ") // 3. Collapse multiple spaces, tabs, and newlines into one space
    .trim();

  const queryArr = normalizedQuery.split(" ").filter(Boolean);

  const andCandidates = [];

  const orCandidates = [];

  for (const w of queryArr) {
    if (STOP_WORDS.has(w.toLowerCase())) continue;

    if (RELEVANT_NOUNS.includes(w.toLowerCase())) {
      andCandidates.push(w);
    } else {
      orCandidates.push(w);
    }
  }

  if (!andCandidates.length && !orCandidates.length) return [] as Retrieved[];

  const ftsQuery = `${andCandidates.join(" AND ")}${andCandidates.length && orCandidates.length ? " OR " : ""}${orCandidates.join(" OR ")}`;

  return statement.all(ftsQuery) as Retrieved[];
};
