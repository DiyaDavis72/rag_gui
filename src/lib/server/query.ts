import { inference } from "./infrence";
import { retrieve } from "./retrieve";

export const query = async ({ query }: { query: string }) => {
  const candidates = await retrieve({ query });

  const result = await inference({ query, candidates });

  return { response: result, context: candidates };
};
