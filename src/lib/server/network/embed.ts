export const embed = async ({ text }: { text: string }) => {
  const embedRes = await fetch("http://127.0.0.1:11434/api/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen3-embedding:4b",
      input: text,
    }),
  });
  const { embeddings } = await embedRes.json();
  return embeddings[0] as number[];
};
