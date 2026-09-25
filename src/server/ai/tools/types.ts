/**
 * Tool abstraction for the agent. Tools are described with a JSON-schema
 * parameter spec so they can be exposed to function-calling models later.
 */
export type JSONSchema = {
  type: "object";
  properties: Record<string, { type: string; description?: string; enum?: string[] }>;
  required?: string[];
};

export type ToolContext = {
  ownerKey: string;
  channel: string;
  signal?: AbortSignal;
};

export interface Tool<TArgs = Record<string, unknown>, TResult = unknown> {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute(args: TArgs, ctx: ToolContext): Promise<TResult>;
}
