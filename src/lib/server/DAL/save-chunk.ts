import { db } from "../db/db";

export const saveChunk = ({
  id,
  chapter_name,
  volume,
  text,
  chapter_id,
  embedding,
}: {
  id: string;
  chapter_id: string;
  chapter_name: string;
  volume: string;
  text: string;
  embedding: string;
}) => {
  const steatement = db.prepare(
    `INSERT INTO chunks (id, chapter_id, chapter_name, volume, text, embedding) VALUES (?, ?, ?, ?, ?, ?)`,
  );

  return steatement.run(id, chapter_id, chapter_name, volume, text, embedding);
};
