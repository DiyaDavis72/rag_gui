export const tools = [
  {
    type: "function",
    function: {
      name: "search",
      description: "Search the novel Frankenstein for relevant excerpts",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Concise search keywords (e.g. 'Elizabeth wedding night death')",
          },
        },
        required: ["query"],
      },
    },
  },
];
