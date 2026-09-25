import { searchKnowledge, type RetrievedChunk } from "@/server/knowledge/retrieval/search";
import type { Tool, ToolContext } from "./types";

export type { Tool, ToolContext } from "./types";

/** Knowledge base search — used by the agent's RAG step on every turn. */
export const knowledgeSearchTool: Tool<{ query: string; topK?: number }, RetrievedChunk[]> = {
  name: "knowledge_search",
  description:
    "Search the FrankTechSpace knowledge base (procedures, troubleshooting guides, service information).",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "What to search for" },
      topK: { type: "number", description: "Maximum results" },
    },
    required: ["query"],
  },
  execute: ({ query, topK }) => searchKnowledge(query, { topK }),
};

/**
 * Tool registry. Future tools (web search, calculator, URL checker, system
 * status…) are registered here and become available to every channel.
 */
const registry = new Map<string, Tool<never>>();

export function registerTool<T, R>(tool: Tool<T, R>) {
  registry.set(tool.name, tool as unknown as Tool<never>);
}

export function listTools() {
  return Array.from(registry.values()).map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}

export async function runTool(name: string, args: unknown, ctx: ToolContext) {
  const tool = registry.get(name) as Tool<unknown> | undefined;
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.execute(args, ctx);
}

registerTool(knowledgeSearchTool);
