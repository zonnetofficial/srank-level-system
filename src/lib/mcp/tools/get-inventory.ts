import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_inventory",
  title: "Get inventory",
  description: "List the items the signed-in hunter currently owns, with quantities and how each item was acquired.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max number of items to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_inventory")
      .select("item_id, quantity, source, acquired_at")
      .eq("user_id", ctx.getUserId())
      .order("acquired_at", { ascending: false })
      .limit(limit ?? 50);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
