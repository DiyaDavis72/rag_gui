import { Database } from "bun:sqlite";
export const db = new Database("frank_rag.sqlite");

export type DB = typeof db;
