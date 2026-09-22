import { getLexical } from "./DAL/lexical";
import { getVector } from "./DAL/vector";
import { rrf } from "./utils/rrf";

export const retrieve = async ({ query }: { query: string }) => {
  const lexical = getLexical({ limit: 30, query });
  const vector = await getVector({ limit: 30, query });
  return rrf(vector, lexical).slice(0, 6);
};
