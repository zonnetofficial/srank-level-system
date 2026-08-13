import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_daily_quests",
  title: "Get daily quests",
  description:
    "Get the signed-in hunter's daily quests for today, including each quest's target, progress and completion state.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_game_state")
      .select("game_state")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const gs = ((data?.game_state ?? {}) as Record<string, unknown>) || {};
    const quests = (gs.dailyQuests ?? gs.quests ?? []) as unknown;
    const payload = { date: gs.lastQuestDate ?? null, quests };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
