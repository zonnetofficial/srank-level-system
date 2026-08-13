import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_hunter_status",
  title: "Get hunter status",
  description:
    "Get the signed-in hunter's current level, XP, stats (INT, STR, AGI, VIT, END), streaks and pending punishments.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_game_state")
      .select("game_state, updated_at")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "No hay progreso guardado todavía." }] };
    }

    const gs = (data.game_state ?? {}) as Record<string, unknown>;
    const summary = {
      level: gs.level ?? null,
      xp: gs.xp ?? null,
      rank: gs.rank ?? null,
      stats: gs.stats ?? null,
      streak: gs.streak ?? null,
      pendingPunishments: gs.pendingPunishments ?? 0,
      monarchMode: gs.monarchMode ?? null,
      updatedAt: data.updated_at,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
