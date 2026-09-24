import { db } from "./db";

export const createSchema = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      chapter_name TEXT NOT NULL,
      volume TEXT NOT NULL,
      text TEXT NOT NULL,
      embedding TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
      text,
      chapter_id,
      volume,
      chapter_name,
      content='chunks',
      content_rowid='rowid'
    );

    CREATE INDEX IF NOT EXISTS idx_chapter
      ON chunks(chapter_id, id);
`);
};
