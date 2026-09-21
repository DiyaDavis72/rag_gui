export type MODEL_CAPABILITIES = "completion" | "tools" | "thinking"

export type MODEL_LIST = {
  name: string;
  model: string;
  size: number;
  capabilities: MODEL_CAPABILITIES[];
}
