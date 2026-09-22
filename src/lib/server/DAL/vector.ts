import { db } from "../db/db";
import { embed } from "../network/embed";
import type { Chunk, Retrieved } from "../types";
import { cosine } from "../utils/cosine";

export const getVector = async ({
  limit = 10,
  query,
}: {
  limit?: number;
  query: string;
}): Promise<Retrieved[]> => {
  const embedding = await embed({ text: query });
  const rows = db.query("SELECT * FROM chunks").all() as Chunk[];

  return rows
    .map((row) => ({
      id: row.id,
      chapter_name: row.chapter_name,
      chapter_id: row.chapter_id,
      volume: row.volume,
      text: row.text,
      score: cosine(embedding, JSON.parse(row.embedding)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
